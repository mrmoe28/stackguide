'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk'

interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  price: number
  interval: string
  features: string[]
  isActive: boolean
  trialDays: number
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<{
    id: string
    status: string
    currentPeriodEnd: string
    plan: {
      name: string
      price: number
      interval: string
      features: string[]
    }
  } | null>(null)

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/square/subscriptions/plans')

      if (!response.ok) {
        throw new Error('Failed to fetch plans')
      }

      const data = await response.json()
      setPlans(data.plans || [])
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/square/subscriptions/current')

      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
      }
    } catch (err) {
      console.error('Error fetching current subscription:', err)
    }
  }

  const handleCardTokenize = async (token: { token: string }, planId: string) => {
    try {
      const response = await fetch('/api/square/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          cardToken: token.token,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      await response.json()

      // Refresh current subscription
      await fetchCurrentSubscription()
      setSelectedPlan(null)

      alert('Subscription created successfully!')
    } catch (error) {
      console.error('Error creating subscription:', error)
      alert('Failed to create subscription. Please try again.')
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
      </div>
    )
  }

  if (currentSubscription) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold">{currentSubscription.plan.name}</p>
              <p className="text-gray-600">{formatPrice(currentSubscription.plan.price)}/{currentSubscription.plan.interval}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status: <span className="font-semibold text-green-600">{currentSubscription.status}</span></p>
              <p className="text-sm text-gray-600">Current period ends: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Features:</p>
              <ul className="space-y-1">
                {currentSubscription.plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">Select the perfect plan for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>

                {plan.trialDays > 0 && (
                  <p className="text-sm text-green-600 font-semibold">
                    {plan.trialDays} days free trial
                  </p>
                )}

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedPlan === plan.id ? (
                  <div className="pt-4">
                    <PaymentForm
                      applicationId={process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ''}
                      locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ''}
                      cardTokenizeResponseReceived={(token) => handleCardTokenize(token, plan.id)}
                    >
                      <CreditCard />
                    </PaymentForm>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setSelectedPlan(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedPlan(plan.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Subscribe Now
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
