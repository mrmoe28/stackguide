'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: 'ekosolarize@gmail.com',
    bio: '',
    company: '',
    location: '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Implement save logic when backend is ready
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative z-10 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300 font-medium">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    className="flex min-h-[100px] w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 dark:focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Tell us a little about yourself"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Professional Details
              </h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="company" className="text-gray-700 dark:text-gray-300 font-medium">
                    Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-gray-700 dark:text-gray-300 font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200 dark:bg-gray-700" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Actions
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100"
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
