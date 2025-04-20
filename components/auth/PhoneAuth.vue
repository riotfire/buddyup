<template>
  <div class="phone-auth">
    <div class="box">
      <h2 class="title is-4 has-text-centered">Sign In with Phone</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label class="label">Phone Number</label>
          <div class="control">
            <input
              v-model="phoneNumber"
              class="input"
              type="tel"
              placeholder="+1 (555) 555-5555"
              required
            />
          </div>
        </div>

        <div v-if="showOTP" class="field">
          <label class="label">Verification Code</label>
          <div class="control">
            <input
              v-model="otp"
              class="input"
              type="text"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button
              class="button is-primary is-fullwidth"
              :class="{ 'is-loading': isLoading }"
              type="submit"
            >
              {{ showOTP ? 'Verify Code' : 'Send Code' }}
            </button>
          </div>
        </div>
      </form>

      <div v-if="error" class="notification is-danger mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const phoneNumber = ref('')
const otp = ref('')
const showOTP = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''

  try {
    if (!showOTP.value) {
      // Send OTP
      const { error: signInError } = await useSupabaseClient().auth.signInWithOtp({
        phone: phoneNumber.value,
      })

      if (signInError) throw signInError
      showOTP.value = true
    } else {
      // Verify OTP
      const { error: verifyError } = await useSupabaseClient().auth.verifyOtp({
        phone: phoneNumber.value,
        token: otp.value,
        type: 'sms',
      })

      if (verifyError) throw verifyError
      
      // Redirect to dashboard on success
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.phone-auth {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.box {
  background: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style> 