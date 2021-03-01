import { Tabs } from 'antd';
import React from 'react';

type AuthTabsPropTypes = {
  activeKey: string;
  handleChange: (key: string) => void;
};

const { TabPane } = Tabs;

const AuthTabs = ({ activeKey, handleChange }: AuthTabsPropTypes) => {
  return (
    <Tabs defaultActiveKey={activeKey} onChange={handleChange}>
      <TabPane tab="Sign In" key="1">
        Sign In
      </TabPane>
      <TabPane tab="Sign Up" key="2">
        Sign Up
      </TabPane>
    </Tabs>
  );
};

export default AuthTabs;
