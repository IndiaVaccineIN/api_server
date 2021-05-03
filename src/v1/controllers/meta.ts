import {Route, Tags, Get, Path} from 'tsoa';
import {State, District} from '../../common/schema/cowin';
import {States} from '../../common/data/states';
import {Districts} from '../../common/data/districts';

const DistByState: {[k: string]: District[]} = {};

Districts.forEach(d => {
  if (!DistByState[d.state_id]) {
    DistByState[d.state_id] = [];
  }
  DistByState[d.state_id].push(d);
});

@Tags('Meta')
@Route('/api/v1/meta')
export class MetaController {
  @Get('/states')
  public async states(): Promise<State[]> {
    return States;
  }
  @Get('/states/{state_id}')
  public async districts(@Path() state_id: string): Promise<District[]> {
    return DistByState[state_id];
  }
}
