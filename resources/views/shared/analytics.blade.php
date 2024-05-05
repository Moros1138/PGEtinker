
@if( !empty(env("CLOUDFLARE_ANALYTICS_TOKEN")))
    <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "{{ env("CLOUDFLARE_ANALYTICS_TOKEN") }}"}'></script><!-- End Cloudflare Web Analytics -->
@endif
