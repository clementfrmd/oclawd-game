import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, ArrowUpDown, Zap, Shield, Clock, Rocket, Loader2, AlertTriangle, Users, Coins } from 'lucide-react';
import { useAccount } from 'wagmi';

const API_BASE = 'https://expenditures-elimination-together-proposals.trycloudflare.com/api';

export function Marketplace() {
  const [activeTab, setActiveTab] = useState('void');
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="nebula" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-400" />
              MARKETPLACE
            </h1>
            <p className="text-gray-400 mt-1">
              Buy $VOID with ETH • Trade resources with other players
            </p>
          </div>
        </div>

        {/* Economy Info Banner */}
        <div className="panel p-4 mb-6 bg-gradient-to-r from-sky-600/10 to-purple-500/10 border-sky-600/30">
          <div className="flex items-start gap-3">
            <Coins className="w-5 h-5 text-sky-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-sky-400 font-medium mb-1">How the Economy Works</p>
              <p className="text-gray-400">
                <strong className="text-white">Resources</strong> (Ore, Crystal, Plasma) are <strong className="text-green-400">produced by your facilities</strong>, not purchased. 
                Only <strong className="text-purple-400">$VOID</strong> can be bought with ETH. 
                Trade resources <strong className="text-sky-400">player-to-player</strong> on the marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'void', label: 'Buy $VOID', icon: Zap },
            { id: 'resources', label: 'Resource Trading', icon: ArrowUpDown },
            { id: 'boosts', label: 'Boosts', icon: Shield },
            { id: 'vessels', label: 'Vessel Market', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-600/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'void' && <VoidPurchase address={address} isConnected={isConnected} />}
        {activeTab === 'resources' && <ResourceMarket address={address} isConnected={isConnected} />}
        {activeTab === 'boosts' && <BoostMarket address={address} isConnected={isConnected} />}
        {activeTab === 'vessels' && <VesselMarket address={address} isConnected={isConnected} />}
      </div>
    </div>
  );
}

function VoidPurchase({ address, isConnected }) {
  const [ethAmount, setEthAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [voidBalance, setVoidBalance] = useState(0);
  
  const VOID_PER_ETH = 10000; // Exchange rate
  const voidAmount = ethAmount ? parseFloat(ethAmount) * VOID_PER_ETH : 0;

  useEffect(() => {
    async function fetchBalance() {
      if (!isConnected || !address) return;
      try {
        const res = await fetch(`${API_BASE}/marketplace/balance?address=${address}`);
        if (res.ok) {
          const data = await res.json();
          setVoidBalance(data.voidBalance || 0);
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    }
    fetchBalance();
  }, [address, isConnected]);

  const handlePurchase = async () => {
    if (!ethAmount || !isConnected) return;
    setLoading(true);
    try {
      // This would integrate with the wallet to send ETH and receive $VOID
      const res = await fetch(`${API_BASE}/marketplace/buy-void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, ethAmount: parseFloat(ethAmount) })
      });
      if (!res.ok) throw new Error('Purchase failed');
      // Refresh balance
      const balanceRes = await fetch(`${API_BASE}/marketplace/balance?address=${address}`);
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setVoidBalance(data.voidBalance || 0);
      }
      setEthAmount('');
    } catch (err) {
      console.error('Purchase error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Purchase Panel */}
      <div className="panel p-6">
        <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          BUY $VOID WITH ETH
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          $VOID is the premium currency used for in-game boosts and special items.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm">You Pay (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.00"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="w-full mt-2 bg-black/30 border border-white/10 rounded px-4 py-3 text-white text-xl font-mono"
            />
          </div>
          
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">You Receive ($VOID)</label>
            <div className="w-full mt-2 bg-black/30 border border-purple-500/30 rounded px-4 py-3 text-purple-400 text-xl font-mono">
              {voidAmount.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            Rate: 1 ETH = {VOID_PER_ETH.toLocaleString()} $VOID
          </div>
          
          <button 
            onClick={handlePurchase}
            disabled={!ethAmount || !isConnected || loading}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              `Buy ${voidAmount.toLocaleString()} $VOID`
            )}
          </button>
        </div>
      </div>
      
      {/* Balance & Info */}
      <div className="space-y-6">
        <div className="panel p-6">
          <h2 className="font-display text-xl text-white mb-4">Your $VOID Balance</h2>
          <div className="text-center py-6">
            <div className="font-mono text-5xl text-purple-400 text-highlight-tertiary mb-2">
              {isConnected ? voidBalance.toLocaleString() : '---'}
            </div>
            <div className="text-gray-400">$VOID available</div>
          </div>
        </div>
        
        <div className="panel p-6">
          <h3 className="font-display text-lg text-white mb-3">What is $VOID?</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-sky-400 mt-0.5" />
              <span>Activate protective shields and boosts</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-400 mt-0.5" />
              <span>Speed up construction and research</span>
            </li>
            <li className="flex items-start gap-2">
              <Rocket className="w-4 h-4 text-green-400 mt-0.5" />
              <span>Unlock additional colony slots</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ResourceMarket({ address, isConnected }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellResource, setSellResource] = useState('ore');
  const [sellAmount, setSellAmount] = useState('');
  const [askPrice, setAskPrice] = useState('');

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/marketplace/resources`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const handleCreateListing = async () => {
    if (!sellAmount || !askPrice || !isConnected) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace/resources/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          resource: sellResource,
          amount: parseInt(sellAmount),
          pricePerUnit: parseFloat(askPrice)
        })
      });
      if (!res.ok) throw new Error('Failed to create listing');
      // Refresh listings
      const listingsRes = await fetch(`${API_BASE}/marketplace/resources`);
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(data.listings || []);
      }
      setSellAmount('');
      setAskPrice('');
    } catch (err) {
      console.error('Listing error:', err);
    }
  };

  const resourceIcons = { ore: '⛏️', crystal: '💎', plasma: '🔮' };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Create Listing */}
      <div className="panel p-6">
        <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          SELL RESOURCES
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          List your produced resources for other players to buy.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm">Resource</label>
            <select
              value={sellResource}
              onChange={(e) => setSellResource(e.target.value)}
              className="w-full mt-2 bg-black/30 border border-white/10 rounded px-4 py-3 text-white"
            >
              <option value="ore">⛏️ Ore</option>
              <option value="crystal">💎 Crystal</option>
              <option value="plasma">🔮 Plasma</option>
            </select>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">Amount</label>
            <input
              type="number"
              min="1"
              placeholder="1000"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="w-full mt-2 bg-black/30 border border-white/10 rounded px-4 py-3 text-white"
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">Price per unit ($VOID)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.10"
              value={askPrice}
              onChange={(e) => setAskPrice(e.target.value)}
              className="w-full mt-2 bg-black/30 border border-white/10 rounded px-4 py-3 text-white"
            />
          </div>
          
          <button 
            onClick={handleCreateListing}
            disabled={!sellAmount || !askPrice || !isConnected}
            className="btn-primary w-full disabled:opacity-50"
          >
            Create Listing
          </button>
        </div>
      </div>

      {/* Active Listings */}
      <div className="lg:col-span-2 panel overflow-hidden">
        <div className="p-4 bg-black/30 border-b border-white/10">
          <h2 className="font-display text-xl text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            PLAYER LISTINGS
          </h2>
          <p className="text-gray-400 text-sm mt-1">Buy resources from other players using $VOID</p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-500/20 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}
        
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-black/20 text-sm text-gray-400 uppercase">
          <div className="col-span-3">Seller</div>
          <div className="col-span-3">Resource</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Action</div>
        </div>

        {/* Listings */}
        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
          {listings.length > 0 ? (
            listings.map((listing, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                <div className="col-span-3">
                  <span className="text-sky-400">{listing.seller}</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <span>{resourceIcons[listing.resource]}</span>
                  <span className="text-white capitalize">{listing.resource}</span>
                </div>
                <div className="col-span-2 font-mono text-white">{listing.amount.toLocaleString()}</div>
                <div className="col-span-2 font-mono text-purple-400">{listing.pricePerUnit} $VOID</div>
                <div className="col-span-2">
                  <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded hover:bg-green-500/30 text-sm">
                    Buy
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No active listings</p>
              <p className="text-sm">Be the first to list resources!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BoostMarket({ address, isConnected }) {
  const [voidBalance, setVoidBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const boosts = [
    { id: 'shield', name: 'Void Shield', description: '48h attack immunity', cost: 1000, icon: Shield, color: 'cyan' },
    { id: 'accelerator', name: 'Accelerator 50%', description: '50% faster construction for 24h', cost: 250, icon: Zap, color: 'orange' },
    { id: 'yield', name: 'Yield Amplifier', description: '+50% resource production for 24h', cost: 200, icon: TrendingUp, color: 'green' },
    { id: 'instant', name: 'Instant Build', description: 'Complete current construction NOW', cost: 500, icon: Clock, color: 'purple' },
    { id: 'colony', name: 'Colony Permit', description: '+1 permanent colony slot', cost: 2000, icon: Rocket, color: 'gold' },
  ];

  useEffect(() => {
    async function fetchBalance() {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/marketplace/balance?address=${address}`);
        if (res.ok) {
          const data = await res.json();
          setVoidBalance(data.voidBalance || 0);
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [address, isConnected]);

  const colorClasses = {
    cyan: 'border-sky-600/30 hover:border-sky-600/50',
    orange: 'border-orange-500/30 hover:border-orange-500/50',
    green: 'border-green-500/30 hover:border-green-500/50',
    purple: 'border-purple-500/30 hover:border-purple-500/50',
    gold: 'border-yellow-500/30 hover:border-yellow-500/50',
  };

  const iconColorClasses = {
    cyan: 'text-sky-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    gold: 'text-yellow-400',
  };

  const handleActivate = async (boostId, cost) => {
    if (!isConnected || voidBalance < cost) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace/activate-boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, boostId })
      });
      if (!res.ok) throw new Error('Failed to activate boost');
      // Refresh balance
      const balanceRes = await fetch(`${API_BASE}/marketplace/balance?address=${address}`);
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setVoidBalance(data.voidBalance || 0);
      }
    } catch (err) {
      console.error('Activation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Balance Header */}
      <div className="panel p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-white mb-1">Your $VOID Balance</h2>
            <p className="text-gray-400 text-sm">Spend $VOID for powerful in-game boosts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-3xl text-purple-400 text-highlight-tertiary">
                {isConnected ? voidBalance.toLocaleString() : '---'}
              </div>
              <div className="text-gray-400 text-sm">$VOID available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Boost Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boosts.map((boost) => {
          const Icon = boost.icon;
          const canAfford = voidBalance >= boost.cost;
          return (
            <div key={boost.id} className={`panel ${colorClasses[boost.color]} p-6 transition-all`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${iconColorClasses[boost.color]}`} />
                </div>
                <div>
                  <h3 className="font-display text-lg text-white">{boost.name}</h3>
                  <p className="text-gray-400 text-sm">{boost.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xl text-purple-400">{boost.cost.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-1">$VOID</span>
                </div>
                <button 
                  onClick={() => handleActivate(boost.id, boost.cost)}
                  disabled={!isConnected || !canAfford}
                  className={`py-2 px-4 text-sm rounded ${
                    canAfford 
                      ? 'btn-primary' 
                      : 'bg-gray-500/20 text-gray-500 border border-gray-500/30 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Activate' : 'Insufficient'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VesselMarket({ address, isConnected }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/marketplace/vessels`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error('Failed to fetch vessel listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-black/30 border-b border-white/10">
        <h2 className="font-display text-xl text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-orange-400" />
          VESSEL MARKETPLACE
        </h2>
        <p className="text-gray-400 text-sm mt-1">Buy and sell ships with other players</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 p-4 bg-black/20 border-b border-white/10 text-sm text-gray-400 uppercase">
        <div className="col-span-3">Seller</div>
        <div className="col-span-3">Vessel</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Price/Unit</div>
        <div className="col-span-2">Action</div>
      </div>

      {/* Listings */}
      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {listings.length > 0 ? (
          listings.map((listing, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
              <div className="col-span-3">
                <span className="text-sky-400">{listing.seller}</span>
              </div>
              <div className="col-span-3 text-white">{listing.vessel}</div>
              <div className="col-span-2 font-mono text-white">{listing.quantity}</div>
              <div className="col-span-2 font-mono text-purple-400">{listing.price} $VOID</div>
              <div className="col-span-2">
                <button className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded hover:bg-green-500/30 text-sm">
                  Buy
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Rocket className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No vessels for sale</p>
            <p className="text-sm">List your ships to sell them to other players</p>
          </div>
        )}
      </div>

      {/* Sell Your Vessels */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <button className="btn-secondary w-full">
          List Your Vessels for Sale
        </button>
      </div>
    </div>
  );
}
