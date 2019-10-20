import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

import App from './App';
import cat from './cat.png';

Enzyme.configure({ adapter: new EnzymeAdapter() });

it('renders without crashing', () => {
  const wrapper = shallow(<App />);
  const appComponent = wrapper.find('.App');
  expect(appComponent.length).toBe(1);
});

it('starts with the correct state', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.state('text')).toBe('');
  expect(wrapper.state('image')).toBe('');
  expect(wrapper.state('name')).toBe('');
  expect(wrapper.state('binary')).toBe('1011011 1110011 1100101 1100011 1100010 1101111 1011101  1011011 101111 1110011 1100101 1100011 1100010 1101111 1011101');
});
