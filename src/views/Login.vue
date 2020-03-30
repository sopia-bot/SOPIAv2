<template>
    <div class="container" style="height:100vh">
        <div class="row align-items-center justify-content-center" style="height: 100%">
            <div class="col-lg-5 col-md-7">
                <div class="card bg-secondary border-0 mb-0">
                    <div class="card-header px-lg-5 bg-transparent pb-3">
                        <div class="text-muted text-center mt-2 mb-3">
                            <small>{{ $t('login.input-serial') }}</small>
                        </div>
                        <base-input alternative
                                    name="Serial"
                                    prepend-icon="ni ni-key-25"
                                    v-model="form.serial"
                                    :placeholder="$t('login.serial')">
                        </base-input>
                    </div>
                    <div class="card-body px-lg-5 py-lg-3">
                        <div class="text-center text-muted mb-4">
                        <small>{{ $t('login.spoon-login') }}</small>
                        </div>
                        <form role>
                            <base-input alternative
                                        class="mb-3"
                                        name="id"
                                        prepend-icon="ni ni-circle-08"
                                        v-model="form.id"
                                        placeholder="Id">
                            </base-input>

                            <base-input alternative
                                        class="mb-3"
                                        name="Password"
                                        prepend-icon="ni ni-lock-circle-open"
                                        type="password"
                                        v-model="form.passwd"
                                        placeholder="Password">
                            </base-input>
                            <div class="text-center">
                            <base-button type="primary" native-type="button" class="my-3">Sign in</base-button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Login',
    data() {
        return {
            form: {
                id: '',
                passwd: '',
                serial: '',
            }
        }
    }
}
</script>