import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom';

import { BaseLayout } from '../components/Layouts';
import { Index } from '../pages/Index';
import { Create } from '../pages/Create';
import { Account } from '../pages/Account';
import { Mint } from '../pages/Mint';
import { AddItem } from '../pages/AddItem';
import { getPath } from '../utils';
import { UmiTest } from "../pages/UmiTest";

const router = createBrowserRouter([
  {
    element: <BaseLayout />,
    children: [
      { path: getPath.index(), element: <Index /> },
      { path: getPath.create(), element: <Create /> },
      { path: getPath.account(':id'), element: <Account /> },
      { path: getPath.mint(':id'), element: <Mint /> },
      { path: getPath.addItem(':id'), element: <AddItem /> },
      { path: getPath.umiTest(), element: <UmiTest /> },
      // { path: '*', element: <Page404 /> },
    ],
  },
]);

export const RouterProvider = () => <ReactRouterProvider router={router} />;
