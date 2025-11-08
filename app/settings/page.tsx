"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { updateEmail } from "@/app/actions/updateEmail"
import { updatePassword } from "@/app/actions/updatePassword"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsUpdatingEmail(true)
    try {
      const result = await updateEmail(email)
      
      if (result.success) {
        toast.success(result.message, {
          description: "You will need to confirm your new email address.",
        })
        setEmail("")
      } else {
        toast.error(result.message || "Failed to update email")
      }
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred")
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsUpdatingPassword(true)
    try {
      const result = await updatePassword(newPassword)
      
      if (result.success) {
        toast.success(result.message)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(result.message || "Failed to update password")
      }
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-4xl py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Separator />

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>
                Update your email address. You'll need to confirm the new email before the change takes effect.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your new email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isUpdatingEmail}
                  />
                </div>
                <Button type="submit" disabled={isUpdatingEmail}>
                  {isUpdatingEmail ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password. Make sure it's at least 6 characters long.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                  />
                </div>
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
