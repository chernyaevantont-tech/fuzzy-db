import './theme/light.css';
import './theme/dark.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppTitle from "../modules/AppTitle/AppTitle";
import { useTheme } from './theme/useTheme';
import ProblemListPage from '../pages/ProblemListPage/ProblemListPage';
import { ProblemPathProvider } from '../storage/ProblemPath';
import ProblemPage from '../pages/ProblemPage/ProblemPage';

function App() {
  useTheme();

  return (
    <ProblemPathProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppTitle />}>
            <Route index element={<ProblemListPage />} />
            <Route path="problem/*" element={<ProblemPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProblemPathProvider>
  );
}

export default App;
