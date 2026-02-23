import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import {motion} from 'framer-motion'
import ChatList from '../ChatSection/ChatList'
import { getAllUsers }from "../../services/user.service";
const HomePage = () => {
  const [allUsers,setAllUsers]=useState([]);

  const getAllUser=async()=>{
    try{
const result = await getAllUsers();

if(result.status==='success'){
  setAllUsers(result.data)
}
 //result.data is an array of user 

 /*

[
  {
    "_id": "456",
    "username": "Alice",
    "ProfilePicture": "alice.jpg",
    "lastSeen": "2026-01-21T14:30:00.000Z",
    "isOnline": true,
    "about": "Love coding!",
    "phoneNumber": "9876543210",
    "phoneSuffix": "+91",
    "conversation": {
      "_id": "conv001",
      "participants": ["123", "456"],
      "lastMessage": {
        "_id": "msg001",
        "content": "Hey, how are you?",
        "createdAt": "2026-01-21T14:25:00.000Z",
        "sender": "123",
        "receiver": "456"
      }
    }
      
  },
  {
    "_id": "789",
    "username": "Bob",
    "ProfilePicture": "bob.png",
    "lastSeen": "2026-01-20T18:00:00.000Z",
    "isOnline": false,
    "about": "Music and travel",
    "phoneNumber": "9123456780",
    "phoneSuffix": "+91",
    "conversation": "0"
  }
]


 */
    }
    catch(error){
console.log(error)
    }
  }

  useEffect(()=>{
    getAllUser();
  
  },[])

  return (
    <Layout>
      <motion.div
      initial= {{opacity:0}}
      animate= {{opacity:1}}
      transform ={{duration:0.5}}
      className='h-full'
      >
        
      <ChatList contacts={allUsers} />
 
      </motion.div>
    </Layout>
  )
}

export default HomePage