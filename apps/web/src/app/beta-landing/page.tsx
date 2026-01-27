'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Trophy, Radio, Lock, Check, Heart, Gift, Award, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function BetaLandingPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Unable to connect. Please try again.')
        setIsVerifying(false)
        return
      }

      // Verify beta code
      const { data: betaCode, error: codeError } = await supabase.from('beta_codes' as any).select('*').eq('code', code.trim().toUpperCase()).eq('is_active', true).single()

      if (codeError || !betaCode) {
        setError('Invalid beta code. Please check and try again.')
        setIsVerifying(false)
        return
      }

      // Check if code is expired
      if ((betaCode as any).expires_at && new Date((betaCode as any).expires_at) < new Date()) {
        setError('This beta code has expired.')
        setIsVerifying(false)
        return
      }

      // Check if code has uses remaining
      if ((betaCode as any).max_uses !== -1 && (betaCode as any).use_count >= (betaCode as any).max_uses) {
        setError('This beta code has reached its maximum uses.')
        setIsVerifying(false)
        return
      }

      // Store code in session for post-login
      sessionStorage.setItem('betaCode', code.trim().toUpperCase())

      // Redirect to login
      router.push('/login?redirect=/&beta=true')
    } catch (err) {
      console.error('Beta code verification error:', err)
      setError('Something went wrong. Please try again.')
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background grid-bg scanlines">
      {/* Header */}
      <header className="flex h-14 items-center justify-center border-b-2 border-neon-pink bg-background-secondary relative z-50">
        <div className="flex items-center gap-0.5">
          <span className="font-display text-lg font-black neon-text-pink">HAWAII</span>
          <span className="font-display text-lg font-bold neon-text-blue">SPORTS</span>
          <span className="font-display text-lg font-bold neon-text-yellow">CENTER</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Pixel Football Field Background Video Effect */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="pixel-football-field">
            {/* Animated yard lines */}
            {[...Array(11)].map((_, i) => (
              <div
                key={i}
                className="yard-line"
                style={{
                  left: `${i * 10}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
            {/* Animated football */}
            <div className="pixel-football" />
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-neon-blue animate-pulse" />
          <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-neon-pink animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-neon-yellow animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-neon-pink opacity-50 animate-pulse" />
              <Lock className="h-20 w-20 neon-text-pink relative animate-neon-flicker" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-wider mb-4">
            <span className="neon-text-pink">BETA</span>
            <br />
            <span className="neon-text-blue">ACCESS</span>
            <br />
            <span className="neon-text-yellow">REQUIRED</span>
          </h1>

          {/* Mission Statement */}
          <div className="scoreboard-panel p-6 md:p-8 max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-neon-pink animate-pulse" />
              <h2 className="font-display text-xl md:text-2xl font-bold neon-text-blue uppercase tracking-wider">
                Our Mission
              </h2>
              <Heart className="h-6 w-6 text-neon-pink animate-pulse" />
            </div>

            <p className="text-foreground text-sm md:text-base leading-relaxed mb-4">
              We're building a <span className="text-neon-yellow font-bold">community-powered platform</span> for Hawaii high school sports.
              By <span className="text-neon-blue font-bold">crowdsourcing live scores and updates</span> from fans, parents, and coaches,
              we're creating something that <span className="text-neon-pink font-bold">gives back</span> to the community—not takes from it.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-3 border border-neon-green/30 bg-neon-green/5 rounded">
                <Gift className="h-8 w-8 text-neon-green mb-2" />
                <p className="text-xs font-display text-neon-green uppercase tracking-wider">Monthly Raffles</p>
                <p className="text-xs text-foreground-muted mt-1">Prizes for contributors</p>
              </div>

              <div className="flex flex-col items-center p-3 border border-neon-blue/30 bg-neon-blue/5 rounded">
                <Award className="h-8 w-8 text-neon-blue mb-2" />
                <p className="text-xs font-display text-neon-blue uppercase tracking-wider">Scholarships</p>
                <p className="text-xs text-foreground-muted mt-1">For student athletes</p>
              </div>

              <div className="flex flex-col items-center p-3 border border-neon-yellow/30 bg-neon-yellow/5 rounded">
                <Users className="h-8 w-8 text-neon-yellow mb-2" />
                <p className="text-xs font-display text-neon-yellow uppercase tracking-wider">Community First</p>
                <p className="text-xs text-foreground-muted mt-1">By fans, for fans</p>
              </div>
            </div>

            <p className="text-foreground-subtle text-xs mt-6 italic">
              Your participation helps fund scholarships, awards, and prizes for the keiki who make Hawaii sports special.
            </p>
          </div>

          {/* Beta Code Form */}
          <div className="scoreboard-panel p-6 max-w-lg mx-auto">
            <p className="font-display text-sm text-foreground-muted uppercase tracking-wider mb-4">
              🏈 Join the Beta Testing Community 🏀
            </p>

            <form onSubmit={handleSubmitCode} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ENTER BETA CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center font-display text-lg tracking-widest uppercase border-2 border-neon-blue bg-background-secondary"
                  maxLength={16}
                  required
                />
                {code.length >= 4 && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-green animate-fade-in" />
                )}
              </div>

              {error && (
                <div className="p-3 border-2 border-neon-pink bg-neon-pink/10">
                  <p className="text-sm text-neon-pink font-display uppercase tracking-wider">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isVerifying || code.length < 4}
                className="w-full btn-neon text-lg py-6"
              >
                {isVerifying ? (
                  <>
                    <Radio className="mr-2 h-5 w-5 animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    ACCESS BETA
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Radio, label: 'LIVE SCORES', desc: 'Real-time updates', color: 'neon-pink' },
              { icon: Trophy, label: 'STANDINGS', desc: 'Track rankings', color: 'neon-blue' },
              { icon: Zap, label: 'LIVE CHAT', desc: 'Fan community', color: 'neon-yellow' },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className={`p-4 border-2 border-${feature.color}/30 bg-${feature.color}/5 rounded animate-fade-in`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <feature.icon className={`h-8 w-8 mx-auto mb-2 text-${feature.color}`} />
                <p className={`font-display text-xs text-${feature.color} uppercase tracking-wider mb-1`}>
                  {feature.label}
                </p>
                <p className="text-xs text-foreground-muted">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-border">
            <p className="text-foreground-muted text-xs">
              Don't have a beta code? Contact us to request access.
            </p>
            <p className="text-foreground-subtle text-xs mt-2">
              Closed beta · Limited access · Hawaii only
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .pixel-football-field {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 9%,
            rgba(34, 197, 94, 0.1) 9%,
            rgba(34, 197, 94, 0.1) 10%
          );
        }

        .yard-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(34, 197, 94, 0.2);
          animation: yard-line-glow 3s ease-in-out infinite;
        }

        @keyframes yard-line-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }

        .pixel-football {
          position: absolute;
          width: 24px;
          height: 12px;
          background: rgba(251, 146, 60, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(251, 146, 60, 0.5);
          animation: football-bounce 4s ease-in-out infinite;
        }

        @keyframes football-bounce {
          0% {
            left: 10%;
            top: 20%;
            transform: rotate(0deg);
          }
          25% {
            left: 30%;
            top: 60%;
            transform: rotate(180deg);
          }
          50% {
            left: 50%;
            top: 30%;
            transform: rotate(360deg);
          }
          75% {
            left: 70%;
            top: 70%;
            transform: rotate(540deg);
          }
          100% {
            left: 90%;
            top: 20%;
            transform: rotate(720deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
