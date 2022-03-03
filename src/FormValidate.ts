import {Component, Vue} from 'vue-property-decorator';
import {Validator} from './Validator';


@Component
export default class FormValidate extends Vue {
    validation!: Validator;

    created() {
        this.validation = Vue.observable(new Validator(this));
        Vue.set(this, 'validation', this.validation);
    }

    beforeDestroy() {
        this.validation.destroy();
    }
}
