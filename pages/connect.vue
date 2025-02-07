<template>
  <div>
    <h2>-------------</h2>

    <div>
      account: {{ address }}
      <br />
      chainId: {{ chainIdAcc }}
      <br />
      status: {{ statusAcc }}
    </div>

    <button v-if="statusAcc !== 'disconnected'" type="button" @click="handleDisconnect">Disconnect</button>

    <h2>--------------</h2>
    <button v-for="connector in connectors" :key="connector.id" type="button" @click="handleConnect(connector)">
      {{ connector.name }}
    </button>

    <div>
      {{ status }}
      {{ error?.message }}
    </div>

    <h2>-------</h2>
    <p>Status: {{ sttBl }}</p>
    <p>Balance: {{ balance?.formatted }}</p>
  </div>
  <h2>------------</h2>
</template>

<script lang="ts" setup>
  import { useAccount, useDisconnect, useChainId, useConnect, useBalance, type Connector } from '@wagmi/vue'
  const { address, chainId: chainIdAcc, status: statusAcc } = useAccount()
  const { disconnectAsync } = useDisconnect()

  const chainId = useChainId()
  const { connectors, error, status, connectAsync } = useConnect()

  // Fetch balance when connected
  const { data: balance, status: sttBl } = useBalance(
    computed(() => ({
      address: address.value,
      watch: true // Auto-update on wallet changes
    }))
  )
  const handleConnect = async (connector: Connector) => {
    await connectAsync({ connector, chainId: chainId.value })
  }

  const handleDisconnect = async () => {
    await disconnectAsync()
    balance.value = undefined
  }
</script>

<style lang="scss"></style>
