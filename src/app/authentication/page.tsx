"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Upload, UserPlus, LogIn } from 'lucide-react';
import {api} from '../../../lib/fetchAPI' ; 
import { useRouter } from 'next/navigation';
type data = {
  username : string , 
  fullname : string , 
  email : string ,
  password : string ,
  avatarURL: string ,
}
type dataregister = {
  username : string , 
  fullname : string , 
  email : string ,
  password : string ,
}
type dataLogin = {
  
  username : string ,
  password : string ,
}
type infor = {
  id : number
  username : string , 
  fullname: string , 
  avatarUrl: string , 
  token : string , 
}
const AuthPages = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<data>({
    username: '',
    fullname: '',
    email: '',
    password: '',
    avatarURL: '' 
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatar , setAvatar] = useState<File>(null) ; 
  // const [login,setLogin] = useState<dataLogin>({
  //   username: '',
  //   password: '',
  // })
  // const [register , setRegister] = useState<dataregister>({
  //   username: '',
  //   fullname: '',
  //   email: '',
  //   password: '',
    
  // })
  const registerAPI = async (dataRegister:dataregister)  =>
  {
    const formData = new FormData();
    formData.append("register", new Blob([JSON.stringify(dataRegister)], {
        type: "application/json"
        }));
    formData.append("avatar" , avatar ) ; 
      const res = await fetch(`${api}register`, {
        method: 'POST',
          body: formData
          });
      // console.log("status" +res.status) 
      if(res.status===200)
      {
        // console.log("da chay vao day")
        alert("đăng kí thành công")  ; 
        setIsLogin(true)  ; 
      }
      else 
      {
        alert("đăng kí thất bại")  ;
      }
  }
  const loginAPI = async(dataLogin:dataLogin) =>{
    const respone = await fetch(`${api}login`,{
      method: 'POST' , 
      headers : {
        "content-type": "application/json" 
       },
       body : JSON.stringify(dataLogin) 
    })
    const data:infor = await respone.json()  ; 
    if(respone.status ==200)
    {
       console.log(data) ;
       document.cookie = `token=${data.token}; path=/; max-age=86400`;
       document.cookie = `username=${data.username}; path=/; max-age=86400`;
       document.cookie = `userId=${data.id}; path=/; max-age=86400`;
       alert("đăng nhập thành công") ; 
       router.push('/');
    }
    else 
    {
      alert("Đăng nhập thất bại")
    }
   

  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    
    const file = e.target.files[0];
    setAvatar(file) ; 
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatarURL: file.name
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.username || !formData.password) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (!isLogin && (!formData.fullname || !formData.email)) {
      alert('Vui lòng nhập đầy đủ thông tin đăng ký!');
      return;
    }

    if (isLogin) {

      // console.log('Đăng nhập:', {
      //   username: formData.username,
      //   password: formData.password
      // });
      // alert('Đăng nhập thành công!');
      const newData:dataLogin = 
      {
        username: formData.username,
        password: formData.password
      }
      loginAPI(newData) ; 
    } else {
      const newData:dataregister = {
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
      } 
      registerAPI(newData)  ; 
      console.log('Đăng ký:', {
        username: formData.username,
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        avatar: formData.avatarURL|| 'No avatar'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullname: '',
      email: '',
      password: '',
      avatarURL: ''
    });
    setAvatarPreview(null);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden transform hover:scale-105 transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {isLogin ? <LogIn size={32} className="text-white" /> : <UserPlus size={32} className="text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </h1>
            <p className="text-white text-opacity-80 text-sm">
              {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới để bắt đầu'}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Avatar Upload (Register only) */}
            {!isLogin && (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden border-4 border-white border-opacity-20">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer transform hover:scale-110 transition-all duration-200 shadow-lg">
                    <Upload size={16} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-white text-opacity-70 text-xs">Chọn ảnh đại diện</p>
              </div>
            )}

            {/* Username */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-black " />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Tên đăng nhập"
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl py-3 pl-10 pr-4 text-black placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              />
            </div>

            {/* Full Name (Register only) */}
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white text-opacity-60" />
                </div>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Họ và tên"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl py-3 pl-10 pr-4 text-black  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>
            )}

            {/* Email (Register only) */}
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white text-opacity-60" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl py-3 pl-10 pr-4 text-black  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-[5px] w-[5px] text-black text-opacity-60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl py-3 pl-10 pr-12 text-black  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-black text-opacity-60 hover:text-black transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-4">
              <p className="text-white text-opacity-70 text-sm">
                {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-blue-300 hover:text-blue-200 font-medium underline transition-colors duration-200"
                >
                  {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-opacity-60 text-xs">
            © 2025 - Được tạo bởi Next.js
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;