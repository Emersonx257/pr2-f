import type {State} from './domain';
export function seed():State{return {
tables:Array.from({length:8},(_,i)=>({id:i+1,code:'M'+String(i+1).padStart(2,'0'),zone:i<6?'Salón principal':'Terraza',capacity:i%3===0?6:4,x:[18,50,82][i%3],y:24+Math.floor((i%6)/3)*48})),
dishes:[['Hamburguesa de la casa','Platos fuertes',5500,'🍔'],['Pollo a la plancha','Platos fuertes',6500,'🍗'],['Pasta al pesto','Platos fuertes',6000,'🍝'],['Ensalada fresca','Entradas',3500,'🥗'],['Sopa del día','Entradas',3000,'🥣'],['Papas crujientes','Entradas',2500,'🍟'],['Limonada natural','Bebidas',1800,'🍋'],['Café de la casa','Bebidas',1500,'☕'],['Agua mineral','Bebidas',1200,'💧'],['Pastel de chocolate','Postres',2800,'🍰']].map((d,i)=>({id:i+1,name:String(d[0]),category:String(d[1]),price:Number(d[2]),icon:String(d[3]),available:true})),
sessions:[],orders:[],notices:[]};}
