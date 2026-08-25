import { getUser, json } from '../../db/helpers.js'

export async function onRequestGet({ request }) {
  const user = await getUser(request)
  return json({ user: user ? { userId: user.userId, email: user.email } : null })
}
