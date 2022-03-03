import { Vue } from 'vue-property-decorator';
import { Validator } from './Validator';
export default class FormValidate extends Vue {
    validation: Validator;
    created(): void;
    beforeDestroy(): void;
}
