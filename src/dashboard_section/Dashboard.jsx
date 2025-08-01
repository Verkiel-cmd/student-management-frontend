import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Webstyles/main_side.css';
import  config from'../auth_section/config';
import Chart from 'chart.js/auto';
let barChartInstance = null;

function Dashboard() {

   

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClass, setTotalClass] = useState(0);
  const [setError] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => localStorage.getItem("sidebarState") === "expanded");
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(() => localStorage.getItem("authDropdownState") === "expanded");
  const [isMultiDropdownOpen, setIsMultiDropdownOpen] = useState(() => localStorage.getItem("multiDropdownState") === "expanded");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Send request to backend to destroy session
      await fetch(`${config.API_URL}/logout`, {
        method: 'POST',
        credentials: 'include' // Ensures cookies/sessions are sent
      });

      // Clear frontend storage
      sessionStorage.clear();

      // Redirect to login page
      navigate('/auth_section/Frontlog');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarState", newState ? "expanded" : "collapsed");
      return newState;
    });
  };

  const handleAuthDropdownClick = () => {
    setIsAuthDropdownOpen(prev => {
      const newState = !prev;
      localStorage.setItem("authDropdownState", newState ? "expanded" : "collapsed");


      if (isMultiDropdownOpen) {
        setIsMultiDropdownOpen(false);
        localStorage.setItem("multiDropdownState", "collapsed");
      }

      return newState;
    });
  };

  const handleMultiDropdownClick = () => {
    setIsMultiDropdownOpen(prev => {
      const newState = !prev;
      localStorage.setItem("multiDropdownState", newState ? "expanded" : "collapsed");


      if (isAuthDropdownOpen) {
        setIsAuthDropdownOpen(false);
        localStorage.setItem("authDropdownState", "collapsed");
      }

      return newState;
    });
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        console.log('Fetching total students...');
        const response = await fetch(`${config.API_URL}/total-students`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTotalStudents(data.total);
      } catch (err) {
        setError('Error fetching total students: ' + err.message);
        console.error(err);
      }
    };

    fetchTotalStudents();
  }, []);


  useEffect(() => {
    const fetchTotalClasses = async () => {
      try {
        console.log('Fetching total students...');
        const response = await fetch(`${config.API_URL}/class-students`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTotalClass(data.total);
      } catch (err) {
        setError('Error fetching total students: ' + err.message);
        console.error(err);
      }
    };

    fetchTotalClasses();
  }, []);

 // Fetch user details
 useEffect(() => {
  const fetchUserDetails = async () => {
    try {
      // First check localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && typeof userData === 'object') {
            setLoggedInUser(userData);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored user data:', e);
          localStorage.removeItem('user');
        }
      }

      // If no valid user in localStorage, try API
      const res = await fetch(`${config.API_URL}/api/user-details`, { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await res.json();
      if (data.user) {
        setLoggedInUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error('No user data in response');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoggedInUser(null);
      localStorage.removeItem('user');
      navigate('/auth_section/Frontlog', { replace: true });
    }
  };

  fetchUserDetails();
}, [navigate]); // Add navigate to dependencies


useEffect(() => {
  if (!barChartInstance) {
    const ctx = document.getElementById('barChart').getContext('2d');

    barChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Colleagues', 'Added Classes'],
        datasets: [{
          label: 'Total',
          data: [totalStudents, totalClass],
          backgroundColor: ['#4CAF50', '#2196F3']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  } else {
    // Update chart if already initialized
    barChartInstance.data.datasets[0].data = [totalStudents, totalClass];
    barChartInstance.update();
  }
}, [totalStudents, totalClass]); // 👈 watch for changes


useEffect(() => {
  return () => {
    if (barChartInstance) {
      barChartInstance.destroy();
      barChartInstance = null;
    }
  };
}, []);

  return (

    <div className={`wrapper ${isSidebarExpanded ? "expanded" : ""}`}>
         <aside id="sidebar" className={isSidebarExpanded ? "expand" : ""}>
           <div className="d-flex">
             <button id="toggle-btn" type="button" onClick={toggleSidebar}>
               <i className="lni lni-grid-alt"></i>
             </button>
             <div className="sidebar-logo">
               <a href="#">Veracity</a>
             </div>
           </div>
           <ul className="sidebar-nav">
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Dashboard" : ""} >
               <Link to="/dashboard_section/Dashboard" className="sidebar-link">
                 <i className="lni lni-users"></i>
                 <span>Dashboard</span>
               </Link>
             </li>
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Classes" : ""}>
               <Link to="/Class_lists/Classes" className="sidebar-link">
                 <i className="lni lni-layout"></i>
                 <span>Classes</span>
               </Link>
             </li>
   
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Lists" : ""}>
               <Link to="/Student_lists/ListStud" className="sidebar-link">
                 <i className="lni lni-agenda"></i>
                 <span>Lists</span>
               </Link>
             </li>
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Auth" : ""}>
               <a href="#" className="sidebar-link has-dropdown" onClick={handleAuthDropdownClick}>
                 <i className="lni lni-protection"></i>
                 <span>Auth</span>
                 {isSidebarExpanded && (
                   <i className={`lni lni-chevron-${isAuthDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '-3rem' }}></i>
                 )}
               </a>
               <ul className={`sidebar-dropdown list-unstyled ${isAuthDropdownOpen ? 'show' : ''}`}>
                 <li className="sidebar-item">
                   <a href="#" className="sidebar-link">Login</a>
                 </li>
                 <li className="sidebar-item">
                   <a href="#" className="sidebar-link">Register</a>
                 </li>
               </ul>
             </li>
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Multi" : ""}>
               <a href="#" className="sidebar-link has-dropdown" onClick={handleMultiDropdownClick}>
                 <i className="lni lni-layout"></i>
                 <span>Multi</span>
                 {isSidebarExpanded && (
                   <i className={`lni lni-chevron-${isMultiDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', marginLeft: '-3rem' }}></i>
                 )}
               </a>
               <ul className={`sidebar-dropdown list-unstyled ${isMultiDropdownOpen ? 'show' : ''}`}>
                 <li className="sidebar-item">
                   <a href="#" className="sidebar-link">Link 1</a>
                 </li>
                 <li className="sidebar-item">
                   <a href="#" className="sidebar-link">Link 2</a>
                 </li>
               </ul>
             </li>
   
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Notification" : ""}>
               <a href="#" className="sidebar-link">
                 <i className="lni lni-popup"></i>
                 <span>Notification</span>
               </a>
             </li>
   
             <li className="sidebar-item" data-tooltip={!isSidebarExpanded ? "Settings" : ""}>
               <a href="#" className="sidebar-link">
                 <i className="lni lni-cog"></i>
                 <span>Settings</span>
               </a>
             </li>
           </ul>
   
   
         </aside>



      <div className="TOP">
        <div className="text-center">
          <div className="top-bar">
            <h1 className="title">UNIVERSITY VERACITY</h1>

            <div className="position-fixed top-0 end-0 mt-2 me-3" style={{ zIndex: 3100 }}>
              {/* Profile Button */}
              <button
                className="d-flex justify-between align-items-center px-3 py-2 rounded shadow-lg bg-white text-dark border border-gray-300"
                onClick={toggleProfileDropdown}
              >
                <span
                  className="fw-semibold text-dark bg-white px-2 py-0.5 rounded-lg"
                  style={{ marginRight: '8px' }}
                >
                  {loggedInUser?.username || "Guest"}
                </span>
                <i className={`lni lni-chevron-${isProfileDropdownOpen ? "up" : "down"} fs-5`}></i>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <ul
                  className="dropdown-menu show position-absolute end-0 mt-2 bg-white shadow-lg rounded border border-gray-300"
                  style={{ zIndex: 3100 }}
                >
                  <li>
                   <a
  href="#"
  className="dropdown-item px-3 py-2 text-dark"
>
  Settings
</a>
<a
  href="/"
  className="dropdown-item px-3 py-2 text-dark"
  onClick={handleLogout}
>
  Logout
</a>
                  </li>
                </ul>
              )}
            </div>


            <div className="parent-container-statistics">



              <div className="total_statistics">
                <h1>Colleagues {totalStudents}</h1>
              </div>

              <div className="total_statistics">
                <h1>Added Classes {totalClass}</h1>
              </div>

              
              <div className="dashboard" style={{ width: '100%'}}>
           <canvas id="barChart" width="400" height="100"></canvas>
             </div>

            </div>


          </div>

        </div>
      </div>
    </div >




















  );

}

export default Dashboard;
