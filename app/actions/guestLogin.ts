"use server"

export async function loginAsGuest() {
  return {
    success: true,
    message: "Logged in as guest",
  }
}
