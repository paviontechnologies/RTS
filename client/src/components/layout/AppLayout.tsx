import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Badge,
  InputBase,
  Menu,
  MenuItem,
  Button,
  Chip,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  LayoutDashboard,
  Users,
  Building2,
  Contact2,
  TrendingUp,
  Briefcase,
  UserCheck,
  GitBranch,
  Send,
  CalendarCheck2,
  Award,
  CheckSquare,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  Menu as MenuIcon,
  ChevronDown,
  LogOut,
  Building,
  FileText,
  Users2,
  MessageSquare,
  PhoneCall,
  Shield,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  header?: string;
  items: NavItem[];
}

const getNavSectionsForRole = (role: string): NavSection[] => {
  if (role === 'SeniorRecruiter') {
    return [
      {
        items: [
          { label: 'Recruiter Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
        ],
      },
      {
        header: 'ATS & SOURCING',
        items: [
          { label: 'Jobs', path: '/ats/jobs', icon: <Briefcase size={19} />, badge: '4' },
          { label: 'Candidates', path: '/ats/candidates', icon: <UserCheck size={19} /> },
          { label: 'Resume Management', path: '/ats/resumes', icon: <FileText size={19} /> },
          { label: 'Recruitment Pipeline', path: '/ats/pipeline', icon: <GitBranch size={19} /> },
          { label: 'Submissions', path: '/ats/submissions', icon: <Send size={19} /> },
          { label: 'Interviews', path: '/ats/interviews', icon: <CalendarCheck2 size={19} /> },
          { label: 'Placements', path: '/ats/placements', icon: <Award size={19} /> },
        ],
      },
      {
        header: 'PRODUCTIVITY',
        items: [
          { label: 'Tasks & Reports', path: '/tasks', icon: <CheckSquare size={19} /> },
        ],
      },
    ];
  }

  if (role === 'AccountManager') {
    return [
      {
        items: [
          { label: 'Account Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
        ],
      },
      {
        header: 'CLIENT & REQUIREMENTS',
        items: [
          { label: 'My Clients', path: '/crm/accounts', icon: <Building2 size={19} /> },
          { label: 'Client Contacts', path: '/crm/contacts', icon: <Contact2 size={19} /> },
          { label: 'Job Requirements', path: '/ats/jobs', icon: <Briefcase size={19} /> },
          { label: 'Recruiter Coordination', path: '/ats/coordination', icon: <Users2 size={19} /> },
          { label: 'Candidate Submissions', path: '/ats/submissions', icon: <Send size={19} /> },
          { label: 'Interviews', path: '/ats/interviews', icon: <CalendarCheck2 size={19} /> },
          { label: 'Client Feedback', path: '/ats/client-feedback', icon: <MessageSquare size={19} /> },
          { label: 'Placements', path: '/ats/placements', icon: <Award size={19} /> },
        ],
      },
    ];
  }

  if (role === 'BusinessDevelopmentExecutive' || role === 'SalesManager' || role === 'SalesBDE') {
    return [
      {
        items: [
          { label: 'Sales Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
        ],
      },
      {
        header: 'CRM & CLIENT ACQUISITION',
        items: [
          { label: 'Leads', path: '/crm/leads', icon: <Users size={19} /> },
          { label: 'Companies', path: '/crm/accounts', icon: <Building2 size={19} /> },
          { label: 'Contacts', path: '/crm/contacts', icon: <Contact2 size={19} /> },
          { label: 'Opportunities', path: '/crm/opportunities', icon: <TrendingUp size={19} /> },
          { label: 'Sales Pipeline', path: '/crm/opportunities', icon: <GitBranch size={19} /> },
          { label: 'Activities', path: '/crm/activities', icon: <PhoneCall size={19} /> },
          { label: 'Follow-ups', path: '/tasks', icon: <CheckSquare size={19} /> },
          { label: 'Tasks & Reports', path: '/reports', icon: <BarChart3 size={19} /> },
        ],
      },
    ];
  }

  // Super Admin Default (Complete Governance)
  return [
    {
      items: [
        { label: 'Super Admin Dashboard', path: '/', icon: <LayoutDashboard size={19} /> },
      ],
    },
    {
      header: 'CRM MANAGEMENT',
      items: [
        { label: 'Leads', path: '/crm/leads', icon: <Users size={19} /> },
        { label: 'Client Accounts', path: '/crm/accounts', icon: <Building2 size={19} /> },
        { label: 'Contacts', path: '/crm/contacts', icon: <Contact2 size={19} /> },
        { label: 'Opportunities', path: '/crm/opportunities', icon: <TrendingUp size={19} /> },
      ],
    },
    {
      header: 'ATS MANAGEMENT',
      items: [
        { label: 'Jobs', path: '/ats/jobs', icon: <Briefcase size={19} />, badge: '4' },
        { label: 'Candidates', path: '/ats/candidates', icon: <UserCheck size={19} /> },
        { label: 'Resume Management', path: '/ats/resumes', icon: <FileText size={19} /> },
        { label: 'Recruitment Pipeline', path: '/ats/pipeline', icon: <GitBranch size={19} /> },
        { label: 'Submissions', path: '/ats/submissions', icon: <Send size={19} /> },
        { label: 'Interviews', path: '/ats/interviews', icon: <CalendarCheck2 size={19} /> },
        { label: 'Placements', path: '/ats/placements', icon: <Award size={19} /> },
      ],
    },
    {
      header: 'SYSTEM ADMINISTRATION',
      items: [
        { label: 'User Management', path: '/settings', icon: <Users size={19} /> },
        { label: 'Role & Permissions', path: '/settings', icon: <Shield size={19} /> },
        { label: 'Organization Settings', path: '/settings', icon: <Settings size={19} /> },
        { label: 'Reports & Analytics', path: '/reports', icon: <BarChart3 size={19} /> },
        { label: 'Audit Logs', path: '/settings', icon: <CheckSquare size={19} /> },
        { label: 'System Settings', path: '/settings', icon: <Building size={19} /> },
      ],
    },
  ];
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [quickCreateAnchor, setQuickCreateAnchor] = useState<null | HTMLElement>(null);
  const [roleSwitcherAnchor, setRoleSwitcherAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const storedUser = localStorage.getItem('pavion_user');
  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : { firstName: 'Vikram', lastName: 'Sharma', role: 'SuperAdmin', email: 'admin@pavion.com' };

  const navSections = getNavSectionsForRole(currentUser.role);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.notifications.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, [currentUser.role]);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifAnchor(null);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pavion_token');
    localStorage.removeItem('pavion_user');
    setProfileAnchor(null);
    window.location.href = '/login';
  };

  const handleSwitchRole = (newRole: string, name: string, email: string) => {
    const updatedUser = {
      ...currentUser,
      role: newRole,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
      email,
    };
    localStorage.setItem('pavion_user', JSON.stringify(updatedUser));
    setRoleSwitcherAnchor(null);
    window.location.reload();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: '#1E3A8A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(30, 58, 138, 0.3)',
          }}
        >
          P
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            Pavion Staffing
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, letterSpacing: '0.04em' }}>
            US ATS + CRM PLATFORM
          </Typography>
        </Box>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {navSections.map((section, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            {section.header && (
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.675rem',
                  letterSpacing: '0.08em',
                  color: '#94A3B8',
                }}
              >
                {section.header}
              </Typography>
            )}
            <List disablePadding>
              {section.items.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        px: 1.5,
                        bgcolor: isActive ? '#EFF6FF' : 'transparent',
                        color: isActive ? '#1E3A8A' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        '&:hover': {
                          bgcolor: isActive ? '#EFF6FF' : '#F8FAFC',
                          color: '#1E3A8A',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: isActive ? '#1E3A8A' : '#64748B',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 700 : 500,
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: isActive ? '#1E3A8A' : '#E2E8F0',
                            color: isActive ? '#FFFFFF' : '#475569',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Organization Badge Footer & Direct Logout */}
      <Box sx={{ p: 1.8, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, overflow: 'hidden' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#DBEAFE', color: '#1E3A8A', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
              <Building size={16} />
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                Pavion Technologies
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} />
                Online
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Log out">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: '#DC2626',
                bgcolor: '#FEE2E2',
                p: 0.8,
                borderRadius: 1.5,
                '&:hover': { bgcolor: '#FCA5A5' },
              }}
            >
              <LogOut size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          color: '#0F172A',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: 64 }}>
          {/* Left section: mobile hamburger + global search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon size={20} />
            </IconButton>

            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: { xs: 180, sm: 260, md: 320 },
                bgcolor: '#F1F5F9',
                borderRadius: 2,
                px: 1.5,
                py: 0.4,
              }}
            >
              <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
              <InputBase
                placeholder="Global search (candidates, jobs, leads)..."
                sx={{ fontSize: '0.875rem', width: '100%' }}
              />
            </Paper>
          </Box>

          {/* Right section: Role Switcher, Quick Create, Notifications, Profile, Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Interactive Role Switcher Dropdown */}
            <Chip
              icon={<ShieldCheck size={15} color="#1E3A8A" />}
              label={
                <span>
                  Role: <strong>{currentUser.role}</strong>
                </span>
              }
              onClick={(e) => setRoleSwitcherAnchor(e.currentTarget)}
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1E3A8A',
                fontWeight: 600,
                border: '1px solid #BFDBFE',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#DBEAFE' },
              }}
              deleteIcon={<ChevronDown size={14} color="#1E3A8A" />}
              onDelete={(e) => setRoleSwitcherAnchor(e.currentTarget as any)}
            />

            <Menu
              anchorEl={roleSwitcherAnchor}
              open={Boolean(roleSwitcherAnchor)}
              onClose={() => setRoleSwitcherAnchor(null)}
              PaperProps={{ sx: { width: 280, borderRadius: 2.5, p: 0.5 } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: '0.04em' }}>
                  SWITCH INTERFACE VIEW:
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                selected={currentUser.role === 'SuperAdmin'}
                onClick={() => handleSwitchRole('SuperAdmin', 'Vikram Sharma', 'admin@pavion.com')}
              >
                👑 <strong>Super Admin</strong> (System Governance)
              </MenuItem>
              <MenuItem
                selected={currentUser.role === 'SeniorRecruiter'}
                onClick={() => handleSwitchRole('SeniorRecruiter', 'Alex Carter', 'alex.carter@pavion.com')}
              >
                🎯 <strong>Senior Recruiter</strong> (ATS Sourcing)
              </MenuItem>
              <MenuItem
                selected={currentUser.role === 'AccountManager'}
                onClick={() => handleSwitchRole('AccountManager', 'Sarah Jenkins', 'sarah.jenkins@pavion.com')}
              >
                💼 <strong>Account Manager</strong> (Client Coordination)
              </MenuItem>
              <MenuItem
                selected={currentUser.role === 'BusinessDevelopmentExecutive'}
                onClick={() => handleSwitchRole('BusinessDevelopmentExecutive', 'Marcus Vance', 'marcus.vance@pavion.com')}
              >
                📈 <strong>Sales / BDE</strong> (CRM Acquisition)
              </MenuItem>
            </Menu>

            {/* Quick Create Action */}
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={(e) => setQuickCreateAnchor(e.currentTarget)}
              sx={{
                bgcolor: '#1E3A8A',
                fontWeight: 700,
                borderRadius: 2,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: '#172554' },
              }}
            >
              Quick Create
            </Button>

            <Menu
              anchorEl={quickCreateAnchor}
              open={Boolean(quickCreateAnchor)}
              onClose={() => setQuickCreateAnchor(null)}
              PaperProps={{ sx: { width: 200, borderRadius: 2, mt: 1 } }}
            >
              <MenuItem onClick={() => { setQuickCreateAnchor(null); navigate('/ats/jobs?action=new'); }}>
                <Briefcase size={16} style={{ marginRight: 10 }} /> Job Requisition
              </MenuItem>
              <MenuItem onClick={() => { setQuickCreateAnchor(null); navigate('/ats/candidates?action=new'); }}>
                <UserCheck size={16} style={{ marginRight: 10 }} /> Add Candidate
              </MenuItem>
              <MenuItem onClick={() => { setQuickCreateAnchor(null); navigate('/crm/leads?action=new'); }}>
                <Users size={16} style={{ marginRight: 10 }} /> New Lead
              </MenuItem>
              <MenuItem onClick={() => { setQuickCreateAnchor(null); navigate('/crm/accounts?action=new'); }}>
                <Building2 size={16} style={{ marginRight: 10 }} /> Client Account
              </MenuItem>
            </Menu>

            {/* Notification Bell with Badge */}
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: '#475569', p: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Bell size={18} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification Popover / Dropdown Menu */}
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{
                sx: { width: 380, maxHeight: 480, borderRadius: 2.5, mt: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} new`} size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700, height: 20 }} />
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    Mark all read
                  </Button>
                )}
              </Box>

              <Box sx={{ overflowY: 'auto', maxHeight: 380 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center', color: '#64748B' }}>
                    <Typography variant="body2">No notifications at the moment.</Typography>
                  </Box>
                ) : (
                  notifications.map((n) => (
                    <MenuItem
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #F1F5F9',
                        bgcolor: n.isRead ? '#FFFFFF' : '#EFF6FF',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        whiteSpace: 'normal',
                        '&:hover': { bgcolor: n.isRead ? '#F8FAFC' : '#DBEAFE' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            n.type === 'INTERVIEW'
                              ? '#EFF6FF'
                              : n.type === 'PLACEMENT'
                              ? '#ECFDF5'
                              : n.type === 'FEEDBACK'
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          color:
                            n.type === 'INTERVIEW'
                              ? '#1E3A8A'
                              : n.type === 'PLACEMENT'
                              ? '#059669'
                              : n.type === 'FEEDBACK'
                              ? '#D97706'
                              : '#475569',
                          mt: 0.5,
                        }}
                      >
                        {n.type === 'INTERVIEW' ? (
                          <CalendarCheck2 size={16} />
                        ) : n.type === 'PLACEMENT' ? (
                          <Award size={16} />
                        ) : n.type === 'FEEDBACK' ? (
                          <MessageSquare size={16} />
                        ) : (
                          <Bell size={16} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {n.title}
                          </Typography>
                          {!n.isRead && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.3, lineHeight: 1.3 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Click to view
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>
            </Menu>

            {/* User Profile */}
            <Box
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#1E3A8A',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {currentUser.role}
                </Typography>
              </Box>
              <ChevronDown size={14} color="#64748B" />
            </Box>

            {/* Quick Direct Logout Button */}
            <Tooltip title="Sign out / Log out">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: '#DC2626',
                  bgcolor: '#FEE2E2',
                  p: 0.9,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#FCA5A5' },
                }}
              >
                <LogOut size={16} />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={() => setProfileAnchor(null)}
              PaperProps={{ sx: { width: 220, borderRadius: 2, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {currentUser.firstName} {currentUser.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {currentUser.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>
                <Settings size={16} style={{ marginRight: 10 }} /> Organization Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogOut size={16} style={{ marginRight: 10, color: '#DC2626' }} /> Log out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawers */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #E2E8F0',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
