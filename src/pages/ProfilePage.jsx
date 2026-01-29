import { useState } from 'react';
import AcademicInfo from '../Components/profile/AcademicInfo';
import Skills from '../Components/profile/Skills';
import Projects from '../Components/profile/Projects';
import Internships from '../Components/profile/Internships';
import Achievements from '../Components/profile/Achievements';
import ProfessionalProfile from '../Components/profile/ProfessionalProfile';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('academic');

  const tabs = [
    { id: 'academic', label: 'Academic Details', component: AcademicInfo },
    { id: 'skills', label: 'Skills', component: Skills },
    { id: 'projects', label: 'Projects', component: Projects },
    { id: 'internships', label: 'Internships', component: Internships },
    { id: 'achievements', label: 'Achievements', component: Achievements },
    { id: 'professional', label: 'Professional Profile', component: ProfessionalProfile },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Profile</h2>
        <p style={styles.subtitle}>Manage your academic and professional information</p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  tabActive: {
    color: '#2196F3',
    borderBottomColor: '#2196F3',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minHeight: '400px',
  },
};

export default ProfilePage;
