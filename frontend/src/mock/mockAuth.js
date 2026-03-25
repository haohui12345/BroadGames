import { users } from './users'

export function mockLogin(email, password) {
  const foundUser = users.find(
    (user) => user.email === email && user.password === password
  )

  if (!foundUser) {
    throw new Error('Email hoặc mật khẩu không đúng')
  }

  return {
    token: 'mock-jwt-token',
    user: {
      id: foundUser.id,
      username: foundUser.username,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
    },
  }
}