import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_USERNAME } from './credentials';

const SESSION_COOKIE_NAME = 'fieldsidekick_session';

export async function createSession(username: string) {
  // In a real app, you'd use a library like 'iron-session' to encrypt the cookie.
  // For this demo, we'll store a simple base64 encoded string.
  const sessionValue = Buffer.from(JSON.stringify({ username, loggedInAt: Date.now() })).toString('base64');
  
  cookies().set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
}

export async function getSession() {
  const sessionValue = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!sessionValue) {
    return null;
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionValue, 'base64').toString());
    return sessionData;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}

export async function verifySession() {
  const session = await getSession();
  if (!session || session.username !== ADMIN_USERNAME) {
    return false;
  }
  return true;
}

export async function protectAdminRoute() {
  if (!(await verifySession())) {
    redirect('/admin');
  }
}
