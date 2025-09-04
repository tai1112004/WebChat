"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail,
  MessageCircle, 
  Users, 
  Search, 
  Send, 
  MoreVertical, 
  UserPlus,
  UserMinus,
  Plus,
  Smile,
  Paperclip,
  Phone,
  Video,
  Settings,
  User,
  Hash,
  X,
  Check,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  EyeOff,
  Edit,
  Copy,
  Trash2,
  Calendar,
  MapPin,
  Shield,
  Bell,
  LogOut,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { getCookie } from './function/GetCookie/GetCookie';
import { api } from '../../lib/fetchAPI';
import WebSocketService from '../../lib/websoket';
import { useRef } from 'react';
type replyChat ={
  replyChat : string ; 
  type : string ; // 'text' or 'image'
}
type chatDetail ={
  id: number;
  type: string; // 'text' or 'image'
  conversation : number ; 
  sender: string;
  reactionChat: reactionChat[] ; 
  reply_contents: replyChat;
  contents: string;
  createdAt: string 
}
type reactionChat = {
  username: string;
  contents: string;
  messageId: number
}

type inforChat = {
  id: number;
  idRecevice: number;
  name: string;
  file_image: string;
  type: string; // 'user' or 'group'
  // time: string;
  // unread: number;
  // online: boolean;
  chatDetails: chatDetail[] ; 
  // Additional properties can be added as needed
}
type friend = {
  id: number , 
  username: string , 
  email : string , 
  fullname : string ,
  avatarUrl: string, 
  createdAt: string 
}

const ChatApp = () => {
  const router = useRouter();
  const [selectedChat, setSelectedChat] = useState<inforChat>();
  const [message, setMessage] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [image , setImage] = useState<File | null>(null);
  // New state for message interactions
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<chatDetail | null>(null);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [hiddenMessages, setHiddenMessages] = useState<Set<number>>(new Set());
  
  const token = getCookie('token');
  const username = getCookie('username');
  const userId = getCookie('userId');
  const chatSubscriptionRef = useRef<any>(null);
  const updateSubscriptionRef = useRef<any>(null);
  const responseInviteSubscriptionRef = useRef<any>(null);
  const sendInviteSubscriptionRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const contacts1Ref = useRef<inforChat[]>([]); 
  const selectedChatRelef = useRef<inforChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [UserList, setUserList] = useState<friend[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendRequests, setFriendRequests] = useState<friend[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usernameReceived, setUsernameReceived] = useState<string | null>(null);
  const usernameReceivedRef = useRef<string | null>(null);
  const [listFriend, setListFriend] = useState<friend[]>([]);
  const [member, setMember] = useState<friend[]>([]);
  const [idGroups,setGroups] = useState<number>(0);
  const addGroupsSubscriptionRef = useRef<any>(null);
 const [searchUser, setSearchUser] = useState<friend[]>([]);
 const [fileImage, setFileImage] = useState<File | null>(null);
 const [showUserReaction, setShowUserReaction] = useState(false);
 const [selectedReaction, setSelectedReaction] = useState<reactionChat | null>(null);
 const updateReactionSubscriptionRef = useRef<any>(null);
  const [idChat, setIdChat] = useState<number | null>(null);
  // const [searchUser, setSearchUser] = useState<friend[]>('');
  // const [search , setSearch] = useState<string>('') ;
  // Available reactions
  const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  // Hàm scroll xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll xuống cuối khi có message mới
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.chatDetails]); 

  const fetchSendChat = async(idReceiver : number , messageContent : string , images : File | null , reply : number , type: string ) => {
    const formData = new FormData();
    // console.log("messagesContent: " + messageContent)
    if(messageContent.trim() !== "") {
      formData.append("contents", messageContent);
      // console.log("test messagaes da chay vao day")
    }
    if (images) {
      formData.append("file_images", images);
      console.log("file _image " + images) ;
    }
    if(reply !== 0) 
      formData.append("reply", new Blob([JSON.stringify(reply)], {
        type: "application/json"
        }));
    if(type === "dm")
    {
      await fetch(`${api}sendsDirectMessages/${idReceiver}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData 
    });
    }
    else if (type === "gm") {
      await fetch(`${api}sendsGroups?idGroups=${selectedChatRelef.current?.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
    }
    
  };
  useEffect(() => {
    const fetchListFriend = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api}getFriends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data: friend[] = await response.json();
        // console.log('Fetched friend requests:', data);
        setListFriend(data);
      } else {
        console.error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };
    fetchListFriend();
  }, [token]);
  useEffect(() => {
    const fetchListFriend = async () => {
      try {
        const response = await fetch(`${api}listFriends`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data: friend[] = await response.json();
        console.log('Fetched friend list:', data);
        setListFriend(data);
      } catch (error) {
        console.error('Error fetching friend list:', error);
      }
    };

    fetchListFriend();
  }, [token]);

  const acceptFriendRequest = async (requestId: number , reponseInvite : string) => {
    try {
      const response = await fetch(`${api}reponseInvite?id=${requestId}&reponse=${reponseInvite}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Cập nhật state local
        // setFriendRequests(prev => 
        //   prev.map(req => 
        //     req.id === requestId 
        //       ? { ...req, status: 'accepted' as const }
        //       : req
        //   )
        // );
        
        // Cập nhật số thông báo chưa đọc
        const newData = friendRequests.filter(req => req.id !== requestId);
        setFriendRequests(newData);
        setUnreadNotifications(prev => Math.max(0, prev - 1));
        
        alert('Đã chấp nhận lời mời kết bạn!');
      } else {
        throw new Error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Có lỗi xảy ra khi chấp nhận lời mời kết bạn');
    }
  };
  const addInvite = async(idReceiver : number) => {
    try {
      const response = await fetch(`${api}requestFriends/${idReceiver}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
       
        alert('Lỗi khi gửi lời mời kết bạn');
      }
      else {
        const newData = UserList.filter(user => user.id !== idReceiver);
        setUserList(newData);
        setSearchUser(newData);
        alert(`Đã gửi lời mời kết bạn `);
      }
    } catch (error) {
      console.error('Error adding invite:', error);
      alert('Lỗi khi gửi lời mời kết bạn');
    }
  };
  const createGroup = async(memberId: number[] , name_group : string , image_group: File ) =>{
    try {
      const params = new URLSearchParams();
      memberId.forEach(id => params.append('member', id.toString()));

      const formData = new FormData();
      formData.append('name_group', name_group);
      formData.append('image_group', image_group);

      const response = await fetch(`${api}createsGroup?${params.toString()}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        // const data: number = await response.json();
        // setGroups(data);
        alert('Nhóm đã được tạo thành công!');
        // console.log('Group created successfully:', data);
        // Handle successful group creation (e.g., update state, show notification)
        
      } else {
        throw new Error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Có lỗi xảy ra khi tạo nhóm');
    }
  }

  useEffect(()=>{
    // console.log(token) ; 
    if (!token) {
      router.push('/authentication');
    } 
  },[])

  // Sample data
  const [contacts1 , setContacts1] = useState<inforChat[]>([])
  useEffect(()=>{
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}getTotalChat`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data:inforChat[] = await response.json();

        // console.log(data) ;
        setContacts1(data);
        contacts1Ref.current = data; // Update the ref with the fetched contacts
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    if (token) {
      fetchData();
    }
  },[token])
  useEffect(()=>{
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}getUser`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data: friend[] = await response.json();
        setUserList(data);
        setSearchUser(data);
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    if (token) {
      fetchData();
      
    }
  },[token])
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  useEffect(() => {
    if (!token) return;

    const initWebSocket = async () => {
      try {
        await WebSocketService.connect(token);
        setConnected(true);
        // console.log('🟢 WebSocket connected');

        // Subscribe to chat updates (danh sách chat)
        if (username ) {
          // console.log('Subscribing to chat updates for user:', username);
          if(selectedChatRelef.current?.type==="dm")
          {
                updateSubscriptionRef.current = WebSocketService.subscribeToChatUpdates(username, (updateData : chatDetail) => {
                  const newContacts = contacts1Ref.current.map(contact => {
                    if (contact.id === updateData.conversation) {
                      const updatedContact = {
                        ...contact,
                        chatDetails: [...contact.chatDetails, updateData]
                      };
                      
                      if (selectedChatRelef.current && selectedChatRelef.current.id === updateData.conversation) {
                        // console.log('🔥 Updating selectedChat:', updatedContact);
                        setSelectedChat(updatedContact);
                        selectedChatRelef.current = updatedContact; 
                      }
                      
                      return updatedContact;
                    }
                    return contact;
                  });
                
                  setContacts1(newContacts);
                  contacts1Ref.current = newContacts;
                  });
          }
          else if (selectedChatRelef.current?.type === "gm") {
          // console.log('Subscribing to group chat updates for group ID:', selectedChat?.id);
            updateSubscriptionRef.current = WebSocketService.subscribeToChatGroupUpdates(selectedChat?.id, (updateData : chatDetail) => {
              // console.log("🔥 Group message update received:", updateData);
                  const newContacts = contacts1Ref.current.map(contact => {
                    if (contact.id === updateData.conversation) {
                      const updatedContact = {
                        ...contact,
                        chatDetails: [...contact.chatDetails, updateData]
                      };
                      
                      if (selectedChatRelef.current && selectedChatRelef.current.id === updateData.conversation) {
                        // console.log('🔥 Updating selectedChat:', updatedContact);
                        setSelectedChat(updatedContact);
                        selectedChatRelef.current = updatedContact; 
                      }
                      
                      return updatedContact;
                    }
                    return contact;
                  });
                
                  setContacts1(newContacts);
                  contacts1Ref.current = newContacts;
                  });
          }
          // console.log("usernameReceivedRef.current " + usernameReceivedRef.current)  ; 
          //   console.log("🔥 Subscribing to send invite updates for user:", usernameReceivedRef.current);
            sendInviteSubscriptionRef.current = WebSocketService.subscribeToSendsInvite( username ,  (data : friend ) => {
              console.log('🔥 Send invite received:', data);
              if(data)
              {
                const newData:friend[] = [...friendRequests, data] ;
                setFriendRequests(newData);
                setUnreadNotifications(newData.length);
                alert(`Bạn có lời mời kết bạn từ ${data.username}`);
              }
            });
            responseInviteSubscriptionRef.current = WebSocketService.subscribeToReponseInvite(username,(data:inforChat) => {
              console.log('🔥 inforchat::', data);
              if(data)
              {
                const newData:inforChat[] = [...contacts1Ref.current, data] ;
                contacts1Ref.current = newData;
                setContacts1(newData);

              }
            });
            addGroupsSubscriptionRef.current = WebSocketService.subscribeToAddGroup(username, (data: inforChat) => {
              console.log('🔥 inforchat::', data);
              if (data) {
                const newData: inforChat[] = [...contacts1Ref.current, data];
                contacts1Ref.current = newData;
                setContacts1(newData);
                alert(`Bạn đã được thêm vào nhóm`);
              }
            });
            updateReactionSubscriptionRef.current = WebSocketService.subscribeToUpdateReaction(selectedChatRelef.current?.id ,(data:chatDetail ) => {
              // console.log("🔥 Reaction update received:", data);
              if(data)
              {
                const newData:chatDetail[] = selectedChatRelef.current?.chatDetails?.map((msg) => {
                  if(msg.id === data.id) {
                    return data;
                  }
                  return msg;
                }) || [];
                if(selectedChatRelef.current) {
                  const updatedChat = {
                    ...selectedChatRelef.current,
                    chatDetails: newData
                  };
                  setSelectedChat(updatedChat);
                  selectedChatRelef.current = updatedChat;
                }
              }
            }) 
      }

      } catch (error) {
        console.error(' WebSocket connection failed:', error);
        setConnected(false);
      }
    };

    initWebSocket();

    // Cleanup
    return () => {
      if(updateReactionSubscriptionRef.current) {
        updateReactionSubscriptionRef.current.unsubscribe();
      }
      if(sendInviteSubscriptionRef.current) {
        sendInviteSubscriptionRef.current.unsubscribe();
      }
      if(responseInviteSubscriptionRef.current) {
        responseInviteSubscriptionRef.current.unsubscribe();
      }
      if (updateSubscriptionRef.current) {
        updateSubscriptionRef.current.unsubscribe();
      }
      if(addGroupsSubscriptionRef.current) {
        addGroupsSubscriptionRef.current.unsubscribe();
      }
      WebSocketService.disconnect();
      setConnected(false);
    };
  }, [token, selectedChat?.id, selectedChat?.type , username , usernameReceived ]);

  useEffect(() => {
    // console.log("contact thay doi" + contacts1)
  }, [contacts1]);
  const reactionFetchAPI = async(reaction: string , messageId:number ) =>{
    try {
      const response = await fetch(`${api}reactionChat/${messageId}?reaction=${reaction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        alert('Đã có lỗi xảy ra, vui lòng thử lại sau!');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }
  const sendMessage = () => {
    if ((message.trim()|| image) && selectedChat) {
      // console.log('Sending message:', message, 'to chat ID:', selectedChat.idRecevice);
      const replyId = replyToMessage ? replyToMessage.id : 0;
      // console.log('Replying to message ID:', replyId);
      // console.log('Image file:', image);
      fetchSendChat(selectedChat.idRecevice, message, image, replyId , selectedChatRelef.current?.type || 'dm');
      setMessage('');
      setReplyToMessage(null);
      setImage(null);
    }
  };

  const selectChat = (chat : inforChat) => {
    selectedChatRelef.current = chat;
    setSelectedChat(chat);
    setShowChatInfo(false);
  };

  // Handle message selection - Remove this function as we're not using click anymore
  const handleMessageClick = (messageId: number) => {
    // This function is no longer needed
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileImage(file);
  };

  // Handle reply to message
  const handleReplyMessage = (message: chatDetail) => {
    setReplyToMessage(message);
    // console.log('Replying to message:', message);
    setSelectedMessage(null);
    setShowMessageOptions(false);
  };

  // Handle add reaction
  const handleAddReaction = (messageId: number, reaction: string) => {
    console.log(`Adding reaction ${reaction} to message ${messageId}`);
    setIdChat(messageId);
    reactionFetchAPI(reaction, messageId);
    setShowReactionPicker(false);
    setSelectedMessage(null);
    setShowMessageOptions(false);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    const newContacts = contacts1Ref.current.filter(contact =>
      contact.name.toLowerCase().includes(value.toLowerCase())
    );
    setContacts1(newContacts);
  };

  // Handle hide message
  const handleHideMessage = (messageId: number) => {
    setHiddenMessages(prev => new Set([...prev, messageId]));
    setSelectedMessage(null);
    setShowMessageOptions(false);
  };

  // Handle copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setSelectedMessage(null);
    setShowMessageOptions(false);
  };

  const addFriend = () => {
    if (newFriendEmail.trim()) {
      alert(`Đã gửi lời mời kết bạn đến ${newFriendEmail}`);
      setNewFriendEmail('');
      setShowAddFriend(false);
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && member.length > 0) {
      const idMember = member.map(m => m.id);
      console.log('Creating group with name:', newGroupName, 'and members:', idMember);
      createGroup(idMember, newGroupName, fileImage ? fileImage : new File([], 'empty.jpg'));
      setNewGroupName('');
      setMember([]);
      setShowCreateGroup(false);
      setFileImage(null);
    }
    else {
      alert('Vui lòng nhập tên nhóm và chọn thành viên.');
    }
     
  };
  const handleReactionClick = (reaction:reactionChat) => {
    setSelectedReaction(reaction);
    setShowUserReaction(true);
  };

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowUserReaction(false);
      setSelectedReaction(null);
    }
  };

  // const toggleMemberSelection = (memberId: any) => {
  //   setSelectedMembers(prev => 
  //     prev.includes(memberId) 
  //       ? prev.filter(id => id !== memberId)
  //       : [...prev, memberId]
  //   );
  // };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center">
              <MessageCircle className="mr-2" size={24} />
              ChatApp
            </h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAddFriend(true)}
                className="p-2 bg-black bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                title="Thêm bạn bè"
              >
                <UserPlus size={18} className="text-white" />
              </button>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-2 bg-black bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                title="Tạo nhóm"
              >
                <Plus size={18} className="text-white" />
              </button>
               <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 bg-black bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  title="Thông báo"
                >
                  <Bell size={18} className="text-white" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              onChange={(e) => handleSearch(e)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {contacts1.map((contact) => (
            <div
              key={contact.id}
              onClick={() => selectChat(contact)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                selectedChat?.id === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
                    <img src={contact.file_image} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  <img src={selectedChat.file_image} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    {selectedChat.name}
                  </h2>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Phone size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Video size={20} />
                </button>
                <button 
                  onClick={() => setShowChatInfo(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Reply Bar */}
            {replyToMessage && (
              replyToMessage.type==="string" ?(
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply size={16} className="text-blue-600" />
                  <div className="text-sm">
                    <p className="text-blue-600 font-medium">{replyToMessage.sender}</p>
                    <p className="text-gray-600 truncate max-w-xs">{replyToMessage.contents}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyToMessage(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              ) : (
                <div className='flex items-center space-x-2'>
                  <Reply size={16} className="text-blue-600" />
                  <div className='flex-1 flex justify-between items-center bg-blue-50 border-b border-blue-200 px-4 py-2 rounded-lg'>

                    <div className=''>
                      <p className="text-blue-600 font-medium">Trả lời {replyToMessage.sender}</p>
                      <div className='w-[50px] h-[50px]  bg-gray-200 rounded-lg overflow-hidden'>
                        <img src={replyToMessage.contents} alt="" className='w-full h-full object-cover' />
                      </div>
                      
                    </div>
                    <button
                    onClick={() => setReplyToMessage(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                    
                    
                  </div>
                </div>
              )
              
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
              <div className="space-y-4">
                {selectedChat.chatDetails?.map((msg) => {
                  if (hiddenMessages.has(msg.id)) return null;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'} relative group`}
                    >
                      <div className={`flex items-end space-x-2 max-w-xs relative ${
                        msg.sender === username ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        {/* Message Actions - Show on hover */}
                        

                        <div>
                          <p className="text-xs text-gray-500 mb-1 ml-2">{msg.sender}</p>
                          
                          {/* Reply indicator */}
                          {msg.reply_contents && (
                            msg.reply_contents.type === "string" && msg.reply_contents.replyChat ? (
                              <div className="mb-2 ml-2 p-2 bg-gray-200 rounded-lg text-xs text-gray-600 border-l-2 border-blue-400">
                                <p className="font-medium">Trả lời:</p>
                                <p className="truncate">{msg.reply_contents.replyChat}</p>
                              </div>
                            ) : msg.reply_contents.type === "image" && msg.reply_contents.replyChat &&(
                              <div className="mb-2 ml-2 p-2 bg-gray-200 rounded-lg text-xs text-gray-600 border-l-2 border-blue-400">
                                <p className="font-medium">Trả lời:</p>
                                <img src={msg.reply_contents.replyChat} alt="" className='w-full h-full object-cover' />
                              </div>
                            )
                          )}
                          {msg.type === 'image' ? (
                            <div className={`px-4 py-2 rounded-2xl transition-all duration-200 hover:shadow-md ${msg.sender === username ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'}`}>
                              <img src={msg.contents} alt="" />
                            </div>
                          ) :(
                            <div
                            className={`px-4 py-2 rounded-2xl transition-all duration-200 hover:shadow-md ${
                              msg.sender === username
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                            }`}
                          >
                            {/* <div>
                              tao dang o day
                              <img src="\test1.jpg" alt="" />
                            </div> */}

                            
                              <p className="text-sm">{msg.contents}</p> 
                            
                           
                            
                            {/* Reactions */}
                            
                            
                            <p className={`text-xs mt-1 ${
                              msg.sender === username ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {msg.createdAt}
                            </p>
                          </div>
                          )}
                          {msg.reactionChat && msg.reactionChat.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-end animate-fadeIn">
                              {msg.reactionChat.map((reaction, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleReactionClick(reaction)}
                                  className="group relative bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 
                                          border border-gray-200 hover:border-blue-300 rounded-full px-3 py-2 
                                          transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md
                                          flex items-center gap-1"
                                >
                                  <span className="text-lg group-hover:animate-bounce">
                                    {reaction.contents}
                                  </span>
                                  
                                  {/* Hover tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                                  bg-gray-800 text-white text-xs rounded-lg px-2 py-1 
                                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                                  pointer-events-none whitespace-nowrap">
                                    Click to see who reacted
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                       {/* Modal/Overlay */}
                          {showUserReaction && selectedReaction && (
                            <div 
                              className="fixed inset-0 bg-opacity-50  flex items-center justify-center z-50 
                                        "
                              onClick={handleCloseModal}
                            >
                              <div className="bg-white rounded-2xl  p-6 m-4 max-w-sm w-full 
                                            ">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{selectedReaction.contents}</span>
                                    <div>
                                      <h3 className="font-semibold text-gray-800">Reaction Details</h3>
                                      
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setShowUserReaction(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <X size={20} className="text-gray-500" />
                                  </button>
                                </div>

                                {/* User info */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 
                                                  rounded-full flex items-center justify-center text-white font-semibold">
                                      {selectedReaction.username}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">{selectedReaction.username}</p>
                                      <p className="text-sm text-gray-500">Reacted with {selectedReaction.contents}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Close button */}
                                <button
                                  onClick={() => setShowUserReaction(false)}
                                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                                          py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 
                                          transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
        
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 ${
                          msg.sender === username ? 'mr-2' : 'ml-2'
                        }`}>
                          <button
                            onClick={() => {
                              const msgData = selectedChat.chatDetails?.find(m => m.id === msg.id);
                              if (msgData) handleReplyMessage(msgData);
                            }}
                            className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
                            title="Trả lời"
                          >
                            <Reply size={14} className="text-gray-600" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedMessage(msg.id);
                              setShowReactionPicker(true);
                            }}
                            className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
                            title="Thả biểu cảm"
                          >
                            <Smile size={14} className="text-gray-600" />
                          </button>
                          
                          <button
                            onClick={() => handleCopyMessage(msg.contents)}
                            className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
                            title="Sao chép"
                          >
                            <Copy size={14} className="text-gray-600" />
                          </button>
                          
                          <button
                            onClick={() => handleHideMessage(msg.id)}
                            className="p-1.5 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
                            title="Ẩn tin nhắn"
                          >
                            <EyeOff size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Options Popup - Remove old popup */}

              {/* Reaction Picker */}
              {showReactionPicker && (
                <div className="fixed inset-0  bg-opacity-20 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-xl p-4">
                    <h3 className="text-lg font-semibold text-center mb-4">Chọn biểu cảm</h3>
                    <div className="flex gap-px-[2px] justify-center">
                      {reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => selectedMessage && handleAddReaction(selectedMessage, reaction)}
                          className="text-2xl p-3 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {reaction}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowReactionPicker(false)}
                      className="w-full mt-4 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="fileInput" 
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImage(file);
                      // console.log(file)  ; 
                     }}
                    accept="image/*"

                  />
                  <button 
                        onClick={() => document.getElementById('fileInput')?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <Paperclip size={20} />
                      </button>

                </div>
                
                <div className="flex-1 relative">
                  {image ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border-b border-blue-200">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt="Preview" 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-sm text-blue-600">{image.name}</span>
                      <button
                        onClick={() => setImage(null)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                  />)}
                  
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Smile size={20} />
                </button>
                <button 
                  onClick={() => sendMessage()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng đến với ChatApp</h2>
              <p className="text-gray-600">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Modal */}
      {showChatInfo && selectedChat && (
        <div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-w-[90vw] mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  Thông tin {selectedChat.type === 'gm' ? 'nhóm' : 'người dùng'}
                </h3>
                <button 
                  onClick={() => setShowChatInfo(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="text-center mb-10">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                  <img src={selectedChat.file_image} alt="" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">{selectedChat.name}</h4>
                {selectedChat.type === 'dm' && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <p className="text-green-600 font-medium">Đang hoạt động</p>
                  </div>
                )}
                {selectedChat.type === 'gm' && (
                  <p className="text-gray-600">Nhóm • 12 thành viên</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <button className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                    <Phone size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Gọi điện</span>
                </button>
                
                <button className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <Video size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Video</span>
                </button>

                <button className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                    <Search size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">Tìm kiếm</span>
                </button>
              </div>

              {/* Detailed Actions */}
              <div className="space-y-2">
                <div className="mb-4">
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">Tùy chọn chat</h5>
                </div>

                <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Thông báo</p>
                    <p className="text-sm text-gray-600">Quản lý âm thanh và thông báo</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Settings size={18} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Tùy chỉnh chat</p>
                    <p className="text-sm text-gray-600">Thay đổi chủ đề, biệt danh</p>
                  </div>
                  
                </button>

                {selectedChat.type === 'gm' && (
                  <>
                    <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Thành viên</p>
                        <p className="text-sm text-gray-600">Xem tất cả thành viên nhóm</p>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Quyền quản trị</p>
                        <p className="text-sm text-gray-600">Quản lý quyền trong nhóm</p>
                      </div>
                    </button>
                  </>
                )}

                {/* Privacy & Support */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <h5 className="text-lg font-semibold text-gray-800 mb-3">Quyền riêng tư & Hỗ trợ</h5>
                </div>

                <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Shield size={18} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">Chặn tin nhắn</p>
                    <p className="text-sm text-gray-600">Không nhận tin nhắn từ người này</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-red-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <LogOut size={18} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-600">
                      {selectedChat.type === 'gm' ? 'Rời nhóm' : 'Xóa cuộc trò chuyện'}
                    </p>
                    <p className="text-sm text-red-500">
                      {selectedChat.type === 'gm' ? 'Bạn sẽ không thể nhận tin nhắn' : 'Xóa toàn bộ lịch sử chat'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showNotifications && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[90vw] mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Bell className="mr-2" size={24} />
                  Thông báo
                  {unreadNotifications > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Notifications Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                /* Loading State */
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải thông báo...</p>
                </div>
              ) : friendRequests.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Không có thông báo mới</h4>
                  <p className="text-gray-600">Bạn sẽ nhận được thông báo khi có lời mời kết bạn</p>
                </div>
              ) : (
                /* Friend Requests List */
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserPlus className="mr-2" size={20} />
                    Lời mời kết bạn 
                    <span className="ml-2 bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                      {friendRequests.length}
                    </span>
                  </h4>
                  
                  {friendRequests.map((request) => (
                    <div 
                      key={request.id}
                      className=" rounded-xl p-4 border transition-all duration-200 hover:shadow-md border-blue-200 bg-blue-50"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          {request.username ? (
                            <img 
                              src={request.avatarUrl} 
                              alt={request.fullname} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span className="text-white text-lg font-semibold">
                              {request.username?.charAt(0)?.toUpperCase() || request.username?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-semibold text-gray-900 truncate">
                              {request.fullname}
                            </h5>
                            <span className="px-2 py-1 text-xs rounded-full font-medium ">
                              Chờ xử lý
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{request.username}</p>
                          <p className="text-xs text-gray-500 truncate">{request.email}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(request.createdAt)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        
                          <div className="flex space-x-2 flex-shrink-0">
                            <button
                              onClick={() => {
                               
                                acceptFriendRequest(request.id , "agree");
                              }}
                              className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Chấp nhận lời mời kết bạn"
                            >
                              <CheckCircle size={16} />
                              <span>Chấp nhận</span>
                            </button>
                            <button
                              onClick={() => {
                                setUsernameReceived(request.username);
                                acceptFriendRequest(request.id , "reject");
                              }}
                              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Từ chối lời mời kết bạn"
                            >
                              <XCircle size={16} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        
                      </div>

                      {/* Request Message */}
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700">
                          <strong>{request.username}</strong> muốn kết bạn với bạn
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {friendRequests.length} lời mời đang chờ xử lý
                </p>
                <button
                  
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tải...' : 'Làm mới'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Friend Modal */}
      {/* Add Friend Modal với danh sách người dùng */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] max-w-[90vw] mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Thêm Bạn Bè</h3>
              <button 
                onClick={() => setShowAddFriend(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Section */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  placeholder="Nhập email của bạn bè"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={addFriend}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Gửi Lời Mời
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">Hoặc chọn từ danh sách</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Search Users */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                onChange={(e) => {
                  // Logic tìm kiếm người dùng
                  console.log(e.target.value);
                  const newData = UserList.filter(user => user.username.toLowerCase().includes( e.target.value));
                  setSearchUser(newData);
                  // Filter UserList based on searchTerm
                }}
              />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {searchUser?.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.fullname} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{user.fullname}</h4>
                        <p className="text-sm text-gray-500 truncate">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Add Friend Button */}
                    <button
                      onClick={() => {
                        // Logic thêm bạn bè cho user này
                        console.log('Adding friend:', user);
                        setUsernameReceived(user.username);
                        usernameReceivedRef.current = user.username;
                        // Gọi API thêm bạn bè với user.id
                        addInvite(user.id);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
                    >
                      <UserPlus size={16} />
                      <span>Thêm</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {(!UserList || UserList.length === 0) && (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Không có người dùng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Tạo Nhóm Mới</h3>
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Tên nhóm"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh nhóm:</h4>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <span className="text-sm text-gray-500">Tải lên tệp</span>
                </label>
              </div>
              <div>
                {fileImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(fileImage)}
                      alt="Group"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Chọn thành viên:</h4>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {listFriend?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img 
                                src={user.avatarUrl} 
                                alt={user.fullname} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className="text-white text-sm font-semibold">
                                {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{user.fullname}</h4>
                            <p className="text-sm text-gray-500 truncate">{user.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Add Friend Button */}
                        <button
                          onClick={() => {
                            const newData: friend[] = [...member, user];
                            setMember(newData);
                            const newListFriend: friend[] = listFriend.filter((friend) => friend.id !== user.id);
                            setListFriend(newListFriend);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <UserPlus size={16} />
                          <span>Thêm</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {(!UserList || UserList.length === 0) && (
                    <div className="text-center py-8">
                      <Users size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Không có người dùng nào</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Tạo Nhóm
                </button>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-2xl p-6 w-96 max-w-md mx-4 max-h-96 overflow-y-auto'>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Thành viên:</h4>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    {member?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img 
                                src={user.avatarUrl} 
                                alt={user.fullname} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className="text-white text-sm font-semibold">
                                {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{user.fullname}</h4>
                            <p className="text-sm text-gray-500 truncate">{user.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Add Friend Button */}
                        <button
                          onClick={() => {
                            const newListFriend: friend[] = [...listFriend, user];
                            setListFriend(newListFriend);
                            const newData: friend[] = member.filter((friend) => friend.id !== user.id);
                            setMember(newData);
                          }}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <UserMinus size={16} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {(!member || member.length === 0) && (
                    <div className="text-center py-8">
                      <Users size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Nhóm Không có ai</p>
                    </div>
                  )}
                </div>
              </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;