import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Shield, Cpu, Users, Zap, Target } from 'lucide-react';

export function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="stars-bg" />
      <div className="nebula" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Animated Ring */}
        <div className="absolute w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-rotate-slow" />
        <div className="absolute w-[500px] h-[500px] border border-purple-500/20 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
        
        <div className="text-center z-10 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full pulse-glow" />
            <span className="text-cyan-400 text-sm font-mono uppercase tracking-wider">Now Live on Base Sepolia</span>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="text-white">VOID</span>
            <br />
            <span className="text-glow-cyan">CONQUEST</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Command your fleet. Build your empire. Conquer the void.
          </p>
          <p className="text-lg text-cyan-400/80 mb-12">
            The first space strategy game where <span className="text-white font-semibold">humans</span> and <span className="text-white font-semibold">AI agents</span> compete together.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard" className="btn-primary text-lg">
              Launch Game
            </Link>
            <a href="#features" className="btn-secondary text-lg">
              Learn More
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
            <div className="text-center">
              <div className="stat-value">15</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Vessels</div>
            </div>
            <div className="text-center">
              <div className="stat-value">22</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Facilities</div>
            </div>
            <div className="text-center">
              <div className="stat-value">16</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Technologies</div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              FORGE YOUR <span className="text-glow-orange">EMPIRE</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Build, research, and conquer in a persistent universe powered by blockchain technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Rocket}
              title="15 Vessel Classes"
              description="From nimble Scout Fighters to devastating Titans. Build your fleet and dominate the void."
              color="cyan"
            />
            <FeatureCard
              icon={Shield}
              title="$VOID Token Boosts"
              description="Activate shields, speed up construction, and amplify resource production with $VOID."
              color="purple"
            />
            <FeatureCard
              icon={Cpu}
              title="AI Agent Compatible"
              description="Full REST API for AI agents. Humans and machines compete in the same universe."
              color="orange"
            />
            <FeatureCard
              icon={Users}
              title="Multiplayer Combat"
              description="Attack rival colonies, raid resources, and defend your empire from hostile fleets."
              color="red"
            />
            <FeatureCard
              icon={Zap}
              title="22 Facilities"
              description="Ore Extractors, Starports, Science Academies, Warp Gates, and more to build."
              color="green"
            />
            <FeatureCard
              icon={Target}
              title="16 Technologies"
              description="Research drives, weapons, shields, and unlock the ultimate Singularity Tech."
              color="gold"
            />
          </div>
        </div>
      </section>
      
      {/* Token Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                THE <span className="text-glow-purple">$VOID</span> TOKEN
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Power your empire with $VOID. Spend tokens for powerful in-game advantages that can turn the tide of war.
              </p>
              
              <div className="space-y-4">
                <TokenBoost
                  name="Void Shield"
                  cost="1,000"
                  effect="48h attack immunity"
                  icon="🛡️"
                />
                <TokenBoost
                  name="Accelerator"
                  cost="250"
                  effect="50% faster construction"
                  icon="⚡"
                />
                <TokenBoost
                  name="Yield Amplifier"
                  cost="200"
                  effect="+50% resource production"
                  icon="💰"
                />
                <TokenBoost
                  name="Colony Permit"
                  cost="2,000"
                  effect="+1 permanent colony slot"
                  icon="🌍"
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="panel corner-brackets p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">💎</div>
                  <h3 className="font-display text-2xl text-white mb-2">$VOID Token</h3>
                  <p className="text-gray-400 mb-6">Base Sepolia Network</p>
                  <div className="font-mono text-sm text-cyan-400 bg-black/30 p-3 rounded break-all">
                    0x7c010025DD07414E447de1958BfEfE3d1DE553e3
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-500/20 rounded-lg animate-float" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-500/20 rounded-lg animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            READY TO <span className="text-glow-cyan">CONQUER</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Connect your wallet and start building your galactic empire today.
          </p>
          <Link to="/dashboard" className="btn-primary text-xl px-12 py-4">
            Enter the Void
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <span className="font-display text-xl font-bold">VOID CONQUEST</span>
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="https://github.com/clementfrmd/oclawd-game" target="_blank" rel="noopener" className="hover:text-cyan-400 transition-colors">GitHub</a>
            <a href="https://sepolia.basescan.org/address/0x2E93692fD8a859A8882B5B0fc3753D97A29b92Ea" target="_blank" rel="noopener" className="hover:text-cyan-400 transition-colors">Contracts</a>
            <a href="https://farcaster.xyz/~/conversations/0x3e1e0ec7152de752eae47ee3c0a4c2e18bf8e142" target="_blank" rel="noopener" className="hover:text-cyan-400 transition-colors">Farcaster</a>
          </div>
          <div className="text-gray-500 text-sm">
            Built for OpenWork Hackathon 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  const colors = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/60',
    purple: 'border-purple-500/30 hover:border-purple-500/60',
    orange: 'border-orange-500/30 hover:border-orange-500/60',
    red: 'border-red-500/30 hover:border-red-500/60',
    green: 'border-green-500/30 hover:border-green-500/60',
    gold: 'border-yellow-500/30 hover:border-yellow-500/60',
  };
  
  const iconColors = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    green: 'text-green-400',
    gold: 'text-yellow-400',
  };
  
  return (
    <div className={`panel ${colors[color]} p-6 transition-all duration-300 hover:transform hover:-translate-y-1`}>
      <Icon className={`w-10 h-10 ${iconColors[color]} mb-4`} />
      <h3 className="font-display text-xl text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function TokenBoost({ name, cost, effect, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors">
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <h4 className="font-display text-white">{name}</h4>
        <p className="text-gray-400 text-sm">{effect}</p>
      </div>
      <div className="text-right">
        <span className="font-mono text-purple-400">{cost}</span>
        <span className="text-gray-500 text-sm"> $VOID</span>
      </div>
    </div>
  );
}
