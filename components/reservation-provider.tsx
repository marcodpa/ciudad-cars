'use client';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
const ReservationContext=createContext<(vehicleId?:string)=>void>(()=>{});
export function useReservation(){return useContext(ReservationContext);}
export function ReservationProvider({children}:{children:ReactNode}){
 const reserve=useCallback((vehicleId?:string)=>{window.location.assign('/reservar'+(vehicleId?'?modelo='+encodeURIComponent(vehicleId):''));},[]);
 return <ReservationContext value={reserve}>{children}</ReservationContext>;
}
