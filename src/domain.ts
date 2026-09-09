export type Role='Admin'|'Waiter'|'Kitchen'|'Cashier';
export type Status='Pending'|'Preparing'|'Ready'|'Delivered'|'Cancelled';
export interface Table {id:number;code:string;zone:string;capacity:number;x:number;y:number}
export interface Dish {id:number;name:string;category:string;price:number;available:boolean;icon:string}
export interface Line {dishId:number;name:string;price:number;quantity:number;instructions:string;allergy:boolean}
export interface Order {id:string;sessionId:string;status:Status;created:string;lines:Line[];reason?:string}
export interface Payment {id:string;amount:number;received:number;change:number;method:'Cash'|'Card';date:string}
export interface Session {id:string;tableId:number;waiter:string;closed:boolean;payments:Payment[]}
export interface Notice {id:string;sessionId:string;text:string;read:boolean}
export interface State {tables:Table[];dishes:Dish[];sessions:Session[];orders:Order[];notices:Notice[]}
export const labels:Record<Status,string>={Pending:'Pendiente',Preparing:'En preparación',Ready:'Listo para entregar',Delivered:'Entregado',Cancelled:'Cancelado'};
export const money=(cents:number)=>new Intl.NumberFormat('es-GT',{style:'currency',currency:'GTQ'}).format(cents/100);
export const orderTotal=(order:Order)=>order.status==='Cancelled'?0:order.lines.reduce((sum,line)=>sum+line.price*line.quantity,0);
export function balance(state:State,id:string){return state.orders.filter(o=>o.sessionId===id).reduce((n,o)=>n+orderTotal(o),0)-(state.sessions.find(s=>s.id===id)?.payments.reduce((n,p)=>n+p.amount,0)??0)}
export function canPay(state:State,id:string){return state.orders.filter(o=>o.sessionId===id).every(o=>o.status==='Delivered'||o.status==='Cancelled')}
export function amountToCents(value:string){if(!/^\d+(\.\d{1,2})?$/.test(value))throw Error('Ingresá un importe con hasta dos decimales.');const [whole,part='']=value.split('.');const result=Number(whole)*100+Number(part.padEnd(2,'0'));if(!Number.isSafeInteger(result))throw Error('Importe demasiado grande.');return result;}
