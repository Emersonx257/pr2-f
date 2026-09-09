<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRestaurant } from './store';

const s = useRestaurant();
const checking = ref(true);
const roles = { Admin: 'Administrador', Waiter: 'Mesero', Kitchen: 'Cocina', Cashier: 'Cajero' };

const showLogin = ref(false);
const loginUsername = ref('admin');
const loginPassword = ref('Admin123!');

const unread = computed(() => s.state.notices.filter(n => !n.read && (s.role === 'Admin' || (s.role === 'Waiter' && s.state.sessions.find(x => x.id === n.sessionId)?.waiter === s.waiter))));
const showNotices = ref(false);

onMounted(async () => {
  await s.checkConnection();
  checking.value = false;
  if (s.isOnline) {
    await s.syncWithBackend();
  }
});

async function handleLogin() {
  await s.loginUser(loginUsername.value, loginPassword.value);
  if (s.isAuthenticated) {
    showLogin.value = false;
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="/">c<span>o</span>manda<i>•</i></a>
      <p class="brand-caption">EL BUEN SERVICIO EMPIEZA AQUÍ</p>
      <div class="workspace">
        <span class="workspace-icon">C</span>
        <div>
          <strong>Casa del sabor</strong>
          <small>Sede principal · Guatemala</small>
        </div>
      </div>

      <p class="nav-label">OPERACIÓN</p>
      <nav>
        <RouterLink to="/"><span>▦</span> Mesas y pedidos</RouterLink>
        <RouterLink to="/cocina"><span>♨</span> Cocina</RouterLink>
        <RouterLink to="/caja"><span>▤</span> Caja y cobros</RouterLink>
        <RouterLink to="/catalogo"><span>☷</span> Catálogo</RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <span class="status-dot" :style="{ background: s.isOnline ? '#22c55e' : '#f59e0b' }"></span>
        {{ checking ? 'Comprobando API…' : s.isOnline ? 'API Conectada (http://localhost:5214)' : 'API Sin conexión' }}
        <p v-if="s.isAuthenticated">Autenticado: {{ s.currentUser?.userName }}</p>
        <p v-else>Servicio Conectado · v1.0</p>
      </div>
    </aside>

    <div class="main-shell">
      <header class="topbar">
        <div>
          <span class="eyebrow">RESTAURANTE</span>
          <strong>Un buen día para servir bien.</strong>
        </div>

        <div class="header-actions">
          <button v-if="s.isOnline && !s.isAuthenticated" class="btn primary" @click="showLogin = true" style="margin-right: 12px; padding: 6px 12px; font-size: 0.85rem;">
            Iniciar Sesión API
          </button>
          <button class="bell" @click="showNotices = !showNotices" aria-label="Ver avisos">
            ♧ <b v-if="unread.length">{{ unread.length }}</b>
          </button>
          <label class="sr-only" for="role">Rol del sistema</label>
          <select id="role" v-model="s.role">
            <option v-for="(label, key) in roles" :key="key" :value="key">{{ label }}</option>
          </select>
          <span class="avatar">{{ s.role.slice(0, 1) }}</span>
        </div>
      </header>

      <div v-if="s.isOnline && s.isAuthenticated" class="demo-banner" style="background: #ecfdf5; color: #065f46; border-bottom: 1px solid #a7f3d0;">
        <span>SISTEMA CONECTADO</span> Frontend sincronizado con backend REST API (pr2-bnd) y SignalR en tiempo real.
      </div>
      <div v-else-if="s.isOnline" class="demo-banner" style="background: #eff6ff; color: #1e40af; border-bottom: 1px solid #bfdbfe;">
        <span>API CONECTADA</span> Backend pr2-bnd listo en puerto 5214. Podés iniciar sesión para sincronizar datos reales.
      </div>
      <div v-else class="demo-banner">
        <span>SISTEMA RESTAURANTE</span> Operación activa local.
      </div>

      <div v-if="showNotices" class="notification-panel">
        <h3>Avisos</h3>
        <p v-if="!unread.length" class="muted">No tenés avisos pendientes.</p>
        <button v-for="n in unread" :key="n.id" class="notice-item" @click="n.read = true; s.save('Aviso leído')">
          {{ n.text }} <small>Marcar leído ✓</small>
        </button>
      </div>

      <!-- Modal Iniciar Sesión API -->
      <div v-if="showLogin" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;" @click.self="showLogin = false">
        <div style="background: white; padding: 24px; border-radius: 12px; max-width: 360px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
          <h3 style="margin-top: 0; margin-bottom: 16px;">Iniciar Sesión API</h3>
          <form @submit.prevent="handleLogin">
            <div style="margin-bottom: 12px;">
              <label style="display: block; font-size: 0.85rem; margin-bottom: 4px;">Usuario</label>
              <input v-model="loginUsername" type="text" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;" />
              <small style="color: #666; font-size: 0.75rem;">Seed: admin, mesero1, mesero2, cocina1, cajero1</small>
            </div>
            <div style="margin-bottom: 16px;">
              <label style="display: block; font-size: 0.85rem; margin-bottom: 4px;">Contraseña</label>
              <input v-model="loginPassword" type="password" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px;" />
              <small style="color: #666; font-size: 0.75rem;">Seed: Admin123!, Waiter123!, Kitchen123!, Cashier123!</small>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" @click="showLogin = false" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 6px; cursor: pointer;">Cancelar</button>
              <button type="submit" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Ingresar</button>
            </div>
          </form>
        </div>
      </div>

      <main>
        <div v-if="s.error" class="alert error" role="alert">
          {{ s.error }}
          <button @click="s.error = ''">Cerrar</button>
        </div>
        <div v-if="s.notice" class="alert success" role="status">
          {{ s.notice }}
          <button @click="s.notice = ''">Cerrar</button>
        </div>
        <RouterView />
      </main>

      <footer>Casa del sabor <span>Hecho para una operación más tranquila.</span></footer>
    </div>
  </div>
</template>