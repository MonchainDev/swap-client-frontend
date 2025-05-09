const tokenLogoBySymbol = (symbol: string) => {
  const defaultLogo = '/token-logos/default.png'
  const tokens = [
    {
      symbol: 'WICS',
      logo: '/token-logos/WICS.png'
    },
    {
      symbol: 'BNB',
      logo: '/token-logos/BNB.png'
    },
    {
      symbol: 'tSui',
      logo: '/token-logos/tSUI.png'
    },
    {
      symbol: 'USDT',
      logo: '/token-logos/USDT.png'
    }
  ]
  if (!symbol) return defaultLogo
  return tokens.find((token) => token.symbol === symbol)?.logo || defaultLogo
}

export default tokenLogoBySymbol
