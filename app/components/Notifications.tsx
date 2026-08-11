"use client";
import { useCallback } from "react";
import { api } from "../lib/api";
import { asArray, formatDate, useResource } from "../lib/hooks";
import { Button, EmptyState, ErrorState, LoadingState, Modal } from "./ui";

export default function Notifications({ onClose, onChanged }: { onClose:()=>void; onChanged:()=>void }) {
  const loader = useCallback(()=>api.notifications.list(), []); const {data,loading,error,reload,setData}=useResource(loader);
  const items=asArray(data);
  async function readAll(){try{await api.notifications.readAll();setData(items.map(i=>({...i,read:true})));onChanged();}catch{}}
  async function read(item:Record<string,any>){if(item.read||item.isRead)return;try{await api.notifications.read(String(item.id));setData(items.map(i=>i.id===item.id?{...i,read:true}:i));onChanged();}catch{}}
  return <Modal title="Notifications" onClose={onClose} footer={<><Button onClick={onClose}>닫기</Button><Button variant="primary" onClick={readAll}>모두 읽음</Button></>}>
    {loading?<LoadingState/>:error?<ErrorState message={error} retry={reload}/>:items.length===0?<EmptyState title="새 알림이 없습니다" description="새로운 알림이 도착하면 여기에 표시됩니다."/>:<div className="notification-list">{items.map((item,i)=><button key={String(item.id||i)} onClick={()=>read(item)}><span className={!item.read&&!item.isRead?"unread-dot":""}/><span><strong>{String(item.title||"알림")}</strong><p>{String(item.message||item.content||"")}</p><small>{formatDate(item.createdAt||item.timestamp)}</small></span></button>)}</div>}
  </Modal>;
}

