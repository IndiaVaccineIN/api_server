import {Body, Post, Route, Tags} from 'tsoa';

import vaccinationFormModel, {
  VaccinationForm,
} from '../../models/vaccination_form';

@Tags('FormController')
@Route('/api/v1/form')
export class FormController {
  @Post('/vaccination_experience')
  public async callRequest(@Body() req: VaccinationForm) {
    console.log(req);

    vaccinationFormModel.create(req, (err, result) => {
      if (err) {
        console.log('error', err, req);
      } else {
        console.log(result);
      }
    });
  }
}
