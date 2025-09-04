import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      // Tạo SockJS connection
      const socket = new SockJS('http://localhost:8081/ws');
      
      // Tạo STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}` // Gửi token để auth
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        onConnect: (frame) => {
          // console.log('Connected to WebSocket:', frame);
          // console.log('🔥 AUTHENTICATED USER:', frame.headers['user-name']); // ✅ Thêm dòng này
        //   const testSub = this.client.subscribe('/topic/test', (message) => {
        //   console.log('🔥🔥🔥 BROADCAST RECEIVED:', JSON.parse(message.body));
        // });
        // console.log('🔥 Test subscription created:', !!testSub);
          this.connected = true;
          resolve(frame);
        },
        onStompError: (frame) => {
          console.error('WebSocket error:', frame);
          reject(frame);
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
          this.connected = false;
        }
      });

      // Kết nối
      this.client.activate();
    });
  }

  // Subscribe để nhận tin nhắn trong chat
  subscribeToChat(chatId, callback) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.client.subscribe(`/topic/chat/${chatId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });

    return subscription;
  }

 // Trong WebSocketService, sửa subscribeToChatUpdates:
subscribeToChatUpdates(userId, callback) {
  // console.log('🔥 === SUBSCRIBE DEBUG ===');
  // console.log('🔥 Subscribing userId:', userId);
  // console.log('🔥 Subscribe path:', `/user/${userId}/queue/chatUpdates`);
  // console.log('🔥 Connected:', this.connected);

  if (!this.connected || !this.client) {
    console.error('❌ WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/user/${userId}/queue/chatUpdates`, (message) => {
    // console.log('🔥🔥🔥 === MESSAGE RECEIVED FROM WEBSOCKET ===');
    // console.log('🔥 Raw message:', message);
    // console.log('🔥 Message body:', message.body);
    // console.log('🔥 Message destination:', message.headers.destination);
    
    try {
      const data = JSON.parse(message.body);
      console.log('🔥 Parsed data:', data);
      callback(data);
    } catch (error) {
      console.error('❌ Parse error:', error);
    }
  });
  console.log('🔥 Subscription object:', subscription);
  return subscription;
}
 subscribeToChatGroupUpdates(groupId, callback) {
  if (!this.connected || !this.client) {
    console.error('WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/topic/group/${groupId}`, (message) => {
    try {  
      const data = JSON.parse(message.body);
      console.log('🔥 Group message received:', data); // ✅ Thêm log debug
      callback(data);
    } catch (error) {
      console.error('❌ Parse error in group message:', error);
    }
  });

  return subscription;
}
subscribeToReponseInvite( username,callback) {
  if (!this.connected || !this.client) {
    console.error('WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/user/${username}/queue/friend/reponseInvite`, (message) => {
    try {
      const data = JSON.parse(message.body);
      console.log('🔥 Response invite received:', data);
      callback(data);
    } catch (error) {
      console.error('❌ Parse error in response invite:', error);
    }
  });

  return subscription;
}
subscribeToSendsInvite( username,callback) {
  if (!this.connected || !this.client) {
    console.error('WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/user/${username}/queue/sendsInvite`, (message) => {
    try {
      const data = JSON.parse(message.body);
      // console.log('🔥 Send invite received:', data);
      callback(data);
    } catch (error) {
      console.error('❌ Parse error in send invite:', error);
    }
  });

  return subscription;
}
subscribeToAddGroup(username , callback) {
  if (!this.connected || !this.client) {
    console.error('WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/user/${username}/queue/addGroups`, (message) => {
    try {
      const data = JSON.parse(message.body);
      console.log('🔥 Add group message received:', data);
      callback(data);
    } catch (error) {
      console.error('❌ Parse error in add group message:', error);
    }
  });

  return subscription;

}
subscribeToUpdateReaction(idConversation , callback) {
  if (!this.connected || !this.client) {
    console.error('WebSocket not connected');
    return;
  }

  const subscription = this.client.subscribe(`/topic/updateReaction/${idConversation}`, (message) => {
    try {
      const data = JSON.parse(message.body);
      console.log('🔥 Update reaction message received:', data);
      callback(data);
    } catch (error) {
      console.error('❌ Parse error in update reaction message:', error);
    }
  });

  return subscription;
}

// Gửi tin nhắn
  sendMessage(chatId, messageData) {
    if (!this.connected || !this.client) {
      console.error('WebSocket not connected');
      return false;
    }

    this.client.publish({
      destination: `/app/chat/${chatId}`,
      body: JSON.stringify(messageData)
    });

    return true;
  }

  // Ngắt kết nối
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
export default new WebSocketService();