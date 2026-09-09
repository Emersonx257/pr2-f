import {beforeEach,describe,expect,it,vi} from 'vitest';
import {createPinia,setActivePinia} from 'pinia';
import {useRestaurant} from './store';
import {amountToCents,balance} from './domain';
beforeEach(()=>{const data=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)});vi.stubGlobal('window',{addEventListener:()=>{}});setActivePinia(createPinia());});
describe('flujo operativo de demostración',()=>{
it('abre, cocina, entrega, cobra parcialmente y libera solo al terminar',()=>{
const s=useRestaurant();s.open(1);const id=s.sessionFor(1)!.id;
s.addOrder(id,[{dishId:1,name:'Ignorado',price:1,quantity:1,instructions:'Sin cebolla <b>texto</b>',allergy:true}]);
const order=s.state.orders[0];expect(order.lines[0].price).toBe(5500);expect(order.lines[0].instructions).toContain('<b>texto</b>');
expect(()=>s.pay(id,5500,5500,'Cash')).toThrow();
s.transition(order.id,'Preparing');s.transition(order.id,'Ready');expect(s.state.notices).toHaveLength(1);s.transition(order.id,'Delivered');
s.pay(id,2000,2000,'Cash');expect(balance(s.state,id)).toBe(3500);expect(s.sessionFor(1)).toBeDefined();
expect(()=>s.addOrder(id,order.lines)).toThrow();
s.pay(id,3500,5000,'Cash');expect(s.sessionFor(1)).toBeUndefined();expect(s.state.sessions[0].payments[1].change).toBe(1500);
});
it('impide doble apertura y acceso operativo de otro mesero',()=>{const s=useRestaurant();s.role='Waiter';s.open(1);expect(()=>s.open(1)).toThrow();s.waiter='Mesero 2';expect(()=>s.addOrder(s.sessionFor(1)!.id,[])).toThrow('otro mesero');});
it('no permite saltar estados ni cobrar de más',()=>{const s=useRestaurant();s.open(1);const id=s.sessionFor(1)!.id;s.addOrder(id,[{dishId:1,name:'',price:0,quantity:1,instructions:'',allergy:false}]);expect(()=>s.transition(s.state.orders[0].id,'Ready')).toThrow();expect(()=>s.pay(id,10000,10000,'Cash')).toThrow();});
it('cierra cuentas vacías y exige motivo de cancelación',()=>{const s=useRestaurant();s.open(1);s.close(s.sessionFor(1)!.id);expect(s.sessionFor(1)).toBeUndefined();s.open(2);const id=s.sessionFor(2)!.id;s.addOrder(id,[{dishId:1,name:'',price:0,quantity:1,instructions:'',allergy:false}]);const o=s.state.orders[0];expect(()=>s.transition(o.id,'Cancelled')).toThrow();s.transition(o.id,'Cancelled','Cliente se retiró');s.close(id);expect(s.sessionFor(2)).toBeUndefined();});
it('convierte dinero sin aproximaciones binarias',()=>{expect(amountToCents('125.10')).toBe(12510);expect(amountToCents('0.1')).toBe(10);expect(()=>amountToCents('1.999')).toThrow();expect(()=>amountToCents('-1')).toThrow();});
});
