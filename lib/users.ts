import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: string
  createdAt: string
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load users from file
export const getUsers = (): User[] => {
  ensureDataDir()
  
  if (!fs.existsSync(USERS_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users file:', error)
    return []
  }
}

// Save users to file
const saveUsers = (users: User[]) => {
  ensureDataDir()
  
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users file:', error)
    throw new Error('Failed to save user data')
  }
}

// Get user by email
export const getUserByEmail = (email: string): User | null => {
  const users = getUsers()
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
}

// Create new user
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const users = getUsers()
  
  // Check if user already exists
  if (getUserByEmail(email)) {
    throw new Error('User already exists')
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)
  
  // Create user
  const newUser: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date().toISOString()
  }
  
  users.push(newUser)
  saveUsers(users)
  
  return newUser
}

// Verify user password
export const verifyPassword = async (email: string, password: string): Promise<User | null> => {
  const user = getUserByEmail(email)
  
  if (!user) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  return isValid ? user : null
}
