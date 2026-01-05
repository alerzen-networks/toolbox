import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { MonitorDashboard } from './pages/MonitorDashboard';
import { IPTool } from './pages/IPTool';
import { DNSTool } from './pages/DNSTool';
import { PortTool } from './pages/PortTool';
import { MacTool } from './pages/MacTool';
import { LatencyTool } from './pages/LatencyTool';
import { SNMPTool } from './pages/SNMPTool';
import { SpeedTestTool } from './pages/SpeedTestTool';
import { SSLTool } from './pages/SSLTool';
import { WhoisTool } from './pages/WhoisTool';
import { SubnetTool } from './pages/SubnetTool';
import { SecurityGradeTool } from './pages/SecurityGradeTool';
import { BlacklistTool } from './pages/BlacklistTool';
import { ZscalerTool } from './pages/ZscalerTool';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="monitor" element={<MonitorDashboard />} />
          <Route path="ip-tools" element={<IPTool />} />
          <Route path="dns-tools" element={<DNSTool />} />
          <Route path="port-tools" element={<PortTool />} />
          <Route path="mac-tools" element={<MacTool />} />
          <Route path="latency-tools" element={<LatencyTool />} />
          <Route path="snmp-tools" element={<SNMPTool />} />
          <Route path="speed-tools" element={<SpeedTestTool />} />
          <Route path="ssl-tools" element={<SSLTool />} />
          <Route path="whois-tools" element={<WhoisTool />} />
          <Route path="subnet-tools" element={<SubnetTool />} />
          <Route path="security-tools" element={<SecurityGradeTool />} />
          <Route path="blacklist-tools" element={<BlacklistTool />} />
          <Route path="zscaler-tools" element={<ZscalerTool />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


