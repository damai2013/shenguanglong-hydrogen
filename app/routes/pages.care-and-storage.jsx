import {redirect} from 'react-router';

export const meta = () => [{title: '沈廣隆｜購買指南'}];

export function loader() {
  throw redirect('/pages/before-you-order#care');
}

export default function CareAndStorage() {
  return null;
}
