<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script>
import { login, CityOrCountyInfos } from '@/api/user'
export default {
  name: 'about',
  data () {
    return {

    };
  },
  props: null,
  components: {
  },
  watch: {

  },
  computed: {

  },
  mounted () {
    this.loadLogin();
    this.loadData();
  },
  methods: {
    /**
     * [loadData axios示例]
     * @return
     */
    loadLogin () {
      login({
        username: "username",
        userpwd: btoa("userpwd"),
        t: new Date().getTime()
      })
        .then(res => {
          if (res.code === 200) {
          }
        })
        .catch(err => {
        })
    },
    loadData () {
      CityOrCountyInfos({
        adminCode: "430100"
      })
        .then(res => {
          if (res.code === 200) {
          }
        })
        .catch(err => {
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.about {
}
</style>