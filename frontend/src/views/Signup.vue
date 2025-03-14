<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Just redirects to the login page with signup mode
  router.replace({ name: 'Login', query: { mode: 'signup' } });
});
</script> 