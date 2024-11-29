import { Outlet } from "react-router-dom";
import '../less/main.less';

const Layout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default Layout;