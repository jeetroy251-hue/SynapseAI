import React, { useEffect } from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { setSelectedConversation } from '../redux/conversationSlice'
import getMessages from '../../features/getMessages'
import { useDispatch, useSelector } from 'react-redux'
import { setArtifacts, setMessages } from '../redux/messageSlice'

const ChatArea = () => {
 const {selectedConversation}=useSelector(state=>state.conversation)
 const dispatch=useDispatch()

  useEffect(()=>{
    let ignore=false
    const getMessg = async()=>{

      if(!selectedConversation || selectedConversation.title=="New Chat"){
        dispatch(setMessages([]))
        dispatch(setArtifacts([]))
        return
      }
      const data=await getMessages(selectedConversation?._id)
      if(ignore) return
      dispatch(setMessages(data))
      
      const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0)
      dispatch(setArtifacts(latestArtifactMessage?.artifacts || []))
    }
    getMessg()
    return ()=>{ignore=true}
  },[selectedConversation?._id])

  return (
    <div className='flex-1 flex flex-col min-w-0'>
     <Nav/>
     <MessageList/>
     <ChatInput/>
    </div>
  )
}

export default ChatArea
