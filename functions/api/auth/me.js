import { getUser, json } from '../../db/helpers.js'

export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env)
  return json({ user: user ? { userId: user.userId, email: user.email } : null })
}
