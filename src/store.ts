import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { seed } from './seed';
import { balance, canPay, type State, type Role, type Line, type Status } from './domain';
import * as api from './shared/api';

const KEY = 'comanda-demo-v1';

export const useRestaurant = defineStore('restaurant', () => {
  const state = ref<State>(seed());
  const role = ref<Role>('Admin');
  const waiter = ref('Mesero 1');
  const error = ref('');
  const notice = ref('');
  const isOnline = ref(false);
  const isAuthenticated = ref(false);
  const currentUser = ref<api.ApiUser | null>(null);

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && Array.isArray(saved.tables) && Array.isArray(saved.sessions) && Array.isArray(saved.orders) && Array.isArray(saved.dishes) && Array.isArray(saved.notices)) {
      state.value = saved;
    }
  } catch {
    error.value = 'No se pudo recuperar la demostración guardada.';
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key === KEY && e.newValue) {
        try { state.value = JSON.parse(e.newValue); } catch { /* Conservar último estado válido. */ }
      }
    });
  }

  const canServe = computed(() => role.value === 'Admin' || role.value === 'Waiter');
  const canCook = computed(() => role.value === 'Admin' || role.value === 'Kitchen');
  const canCharge = computed(() => role.value === 'Admin' || role.value === 'Cashier');

  function save(message: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(state.value));
    }
    notice.value = message;
    error.value = '';
  }

  function act(fn: () => void) {
    try {
      fn();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo completar la acción.';
    }
  }

  async function checkConnection() {
    isOnline.value = await api.checkBackend();
    return isOnline.value;
  }

  async function loginUser(username: string, pass: string) {
    try {
      error.value = '';
      const res = await api.login(username, pass);
      isAuthenticated.value = true;
      currentUser.value = res.user;
      role.value = res.user.role as Role;
      waiter.value = res.user.userName;

      // Conectar SignalR
      api.connectSignalR(() => {
        syncWithBackend();
      });

      await syncWithBackend();
      save(`Sesión iniciada como ${res.user.userName} (${res.user.role}).`);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error de autenticación con la API.';
    }
  }

  async function syncWithBackend() {
    if (!isOnline.value && !(await checkConnection())) return;
    try {
      const [apiTables, apiMenuItems] = await Promise.all([
        api.getTables().catch(() => []),
        api.getMenuItems().catch(() => [])
      ]);

      if (apiTables.length) {
        state.value.tables = apiTables.map(t => ({
          id: t.id,
          code: t.code,
          zone: t.zone,
          capacity: t.capacity,
          x: t.positionX,
          y: t.positionY
        }));
      }

      if (apiMenuItems.length) {
        state.value.dishes = apiMenuItems.map(d => ({
          id: d.id,
          name: d.name,
          category: d.category,
          price: Math.round(d.price * 100),
          available: d.isAvailable,
          icon: '🍽️'
        }));
      }

      if (isAuthenticated.value) {
        const [apiSessions, apiOrders, apiNotices] = await Promise.all([
          api.getOpenSessions().catch(() => []),
          api.getOrders().catch(() => []),
          api.getNotifications().catch(() => [])
        ]);

        state.value.sessions = apiSessions.map(s => ({
          id: s.id,
          tableId: s.tableId,
          waiter: s.waiterName,
          closed: s.status === 'Closed',
          payments: (s.payments || []).map(p => ({
            id: p.id,
            amount: Math.round(p.amountApplied * 100),
            received: Math.round((p.amountReceived ?? p.amountApplied) * 100),
            change: Math.round((p.changeGiven ?? 0) * 100),
            method: (p.method === 'Card' ? 'Card' : 'Cash') as 'Cash' | 'Card',
            date: p.paidAtUtc
          }))
        }));

        state.value.orders = apiOrders.map(o => ({
          id: o.id,
          sessionId: o.sessionId,
          status: o.status as Status,
          created: o.createdAtUtc,
          reason: o.cancellationReason,
          lines: o.items.map(i => ({
            dishId: i.menuItemId,
            name: i.historicalName,
            price: Math.round(i.historicalPrice * 100),
            quantity: i.quantity,
            instructions: i.specialInstructions || '',
            allergy: i.hasAllergyAlert
          }))
        }));

        state.value.notices = apiNotices.map(n => ({
          id: n.id,
          sessionId: n.relatedSessionId || '',
          text: n.message,
          read: n.isRead
        }));
      }
    } catch (e) {
      console.warn('Error al sincronizar con backend:', e);
    }
  }

  function sessionFor(tableId: number) {
    return state.value.sessions.find(s => s.tableId === tableId && !s.closed);
  }

  function session(id: string) {
    const s = state.value.sessions.find(s => s.id === id && !s.closed);
    if (!s) throw Error('La cuenta ya está cerrada.');
    return s;
  }

  function owns(id: string) {
    const s = session(id);
    if (role.value === 'Waiter' && s.waiter !== waiter.value) throw Error('Esta cuenta pertenece a otro mesero.');
    return s;
  }

  function open(tableId: number) {
    if (!canServe.value) throw Error('Tu rol no puede abrir cuentas.');
    if (sessionFor(tableId)) throw Error('La mesa ya tiene una cuenta abierta.');

    const newId = crypto.randomUUID();
    state.value.sessions.push({ id: newId, tableId, waiter: waiter.value, closed: false, payments: [] });
    save('Cuenta abierta. Ya podés agregar un pedido.');

    if (isAuthenticated.value) {
      api.openSession(tableId).then(() => syncWithBackend()).catch(e => {
        error.value = e instanceof Error ? e.message : 'Error al comunicar apertura a la API backend.';
      });
    }
  }

  function addOrder(id: string, lines: Line[]) {
    if (!canServe.value) throw Error('Tu rol no puede enviar pedidos.');
    const s = owns(id);
    if (s.payments.length) throw Error('La cuenta tiene pagos y no admite nuevos pedidos.');
    if (!lines.length) throw Error('Agregá al menos un platillo.');

    const verified = lines.map(l => {
      const dish = state.value.dishes.find(d => d.id === l.dishId && d.available);
      if (!dish) throw Error('Un platillo ya no está disponible.');
      if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 99 || l.instructions.length > 500) {
        throw Error('Revisá cantidades e instrucciones.');
      }
      return { ...l, name: dish.name, price: dish.price };
    });

    const orderId = crypto.randomUUID();
    state.value.orders.push({ id: orderId, sessionId: id, status: 'Pending', created: new Date().toISOString(), lines: verified });
    save('Pedido enviado a cocina.');

    if (isAuthenticated.value) {
      const apiItems = verified.map(v => ({
        menuItemId: v.dishId,
        quantity: v.quantity,
        specialInstructions: v.instructions,
        hasAllergyAlert: v.allergy
      }));
      api.createOrder(id, apiItems).then(() => syncWithBackend()).catch(e => {
        error.value = e instanceof Error ? e.message : 'Error al enviar pedido a la API backend.';
      });
    }
  }

  function transition(id: string, next: Status, reason = '') {
    const o = state.value.orders.find(o => o.id === id);
    if (!o) throw Error('Pedido inexistente.');
    const s = session(o.sessionId);

    if (next === 'Preparing' || next === 'Ready') {
      if (!canCook.value) throw Error('Solo cocina puede realizar esta acción.');
    } else {
      if (!canServe.value) throw Error('Tu rol no puede realizar esta acción.');
      owns(s.id);
    }

    const allowed = (o.status === 'Pending' && next === 'Preparing') ||
      (o.status === 'Preparing' && next === 'Ready') ||
      (o.status === 'Ready' && next === 'Delivered') ||
      (o.status === 'Pending' && next === 'Cancelled' && !s.payments.length && reason.trim());

    if (!allowed) throw Error('El pedido cambió o la transición no está permitida.');
    o.status = next;
    if (next === 'Cancelled') o.reason = reason;

    if (next === 'Ready') {
      state.value.notices.push({ id: crypto.randomUUID(), sessionId: s.id, text: 'Pedido listo · ' + state.value.tables.find(t => t.id === s.tableId)?.code, read: false });
    }
    save('Estado del pedido actualizado.');

    if (isAuthenticated.value) {
      let promise: Promise<any>;
      if (next === 'Preparing') promise = api.startOrder(id);
      else if (next === 'Ready') promise = api.readyOrder(id);
      else if (next === 'Delivered') promise = api.deliverOrder(id);
      else if (next === 'Cancelled') promise = api.cancelOrder(id, reason);
      else promise = Promise.resolve();

      promise.then(() => syncWithBackend()).catch(e => {
        error.value = e instanceof Error ? e.message : 'Error al actualizar estado en la API backend.';
      });
    }
  }

  function pay(id: string, amount: number, received: number, method: 'Cash' | 'Card') {
    if (!canCharge.value) throw Error('Solo caja puede cobrar.');
    const s = session(id);
    const due = balance(state.value, id);
    if (!canPay(state.value, id)) throw Error('Primero entregá o cancelá todos los pedidos.');
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > due) throw Error('El importe debe ser positivo y no superar el saldo.');
    if (method === 'Cash' && (!Number.isSafeInteger(received) || received < amount)) throw Error('El efectivo recibido no cubre el importe.');

    s.payments.push({
      id: crypto.randomUUID(),
      amount,
      received: method === 'Cash' ? received : amount,
      change: method === 'Cash' ? received - amount : 0,
      method,
      date: new Date().toISOString()
    });

    if (balance(state.value, id) === 0) s.closed = true;
    save(s.closed ? 'Pago completo. Mesa liberada.' : 'Pago parcial registrado. La mesa sigue ocupada.');

    if (isAuthenticated.value) {
      api.registerPayment(id, {
        method,
        amountApplied: amount / 100,
        amountReceived: received / 100
      }).then(() => syncWithBackend()).catch(e => {
        error.value = e instanceof Error ? e.message : 'Error al registrar cobro en la API backend.';
      });
    }
  }

  function close(id: string) {
    if (!canCharge.value) throw Error('Solo caja puede cerrar.');
    const s = session(id);
    if (balance(state.value, id) !== 0 || !canPay(state.value, id)) throw Error('La cuenta todavía no puede cerrarse.');
    s.closed = true;
    save('Cuenta cerrada y mesa liberada.');

    if (isAuthenticated.value) {
      api.closeSession(id).then(() => syncWithBackend()).catch(e => {
        error.value = e instanceof Error ? e.message : 'Error al cerrar cuenta en la API backend.';
      });
    }
  }

  return {
    state, role, waiter, error, notice, isOnline, isAuthenticated, currentUser,
    canServe, canCook, canCharge,
    act, save, sessionFor, open, addOrder, transition, pay, close,
    checkConnection, loginUser, syncWithBackend
  };
});
