import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Button, Accordion, AccordionSummary, AccordionDetails, Divider, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CompareIcon from '@mui/icons-material/Compare';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const BillingInsurance = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
        Billing & Insurance
      </Typography>
      
      {/* Introduction Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Healthcare Billing, Simplified
        </Typography>
        <Typography variant="body1" paragraph>
          Say goodbye to confusing medical bills and insurance paperwork. Our AI-powered telehealth platform 
          revolutionizes healthcare billing by bringing transparency, automation, and simplicity to every step 
          of the process.
        </Typography>
        <Typography variant="body1">
          Unlike traditional healthcare systems that leave you guessing about costs until weeks after your visit, 
          our platform provides real-time cost estimates, verifies your insurance benefits automatically, and helps 
          you understand exactly what you'll pay before receiving care.
        </Typography>
      </Paper>

      {/* Insurance Verification Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VerifiedIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Insurance Verification & Eligibility
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              Our AI system automatically verifies your insurance coverage before every appointment, saving you time 
              and preventing surprise bills. Simply upload your insurance card once, and we handle the rest.
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><VerifiedIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Real-time Benefits Verification" 
                  secondary="Instantly check if your provider is in-network and what services are covered"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><VerifiedIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Cost Estimates" 
                  secondary="See your expected out-of-pocket costs before your appointment"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><VerifiedIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Coverage Details" 
                  secondary="Understand your deductible status, co-pays, and coverage limits"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image="https://via.placeholder.com/600x350?text=Insurance+Verification+Screen"
                alt="Insurance verification example screen"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Example of the insurance verification screen showing coverage details and cost estimates.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Payment Features */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PaymentIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Payment Features
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image="https://via.placeholder.com/600x350?text=Payment+Options+Screen"
                alt="Payment options screen"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Our platform supports multiple payment methods and flexible payment options.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              We offer flexible payment options designed to accommodate your financial situation and preferences.
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><PaymentIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Multiple Payment Methods" 
                  secondary="Credit/debit cards, HSA/FSA accounts, PayPal, and more"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PaymentIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Customized Payment Plans" 
                  secondary="Break larger expenses into manageable monthly payments"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PaymentIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Automated Billing" 
                  secondary="Securely save payment methods for recurring services"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PaymentIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Digital Receipts & Payment Tracking" 
                  secondary="Track all your healthcare expenses in one place"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>

      {/* Claims Processing */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ReceiptIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Claims Processing
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              We take the hassle out of insurance claims by handling the entire process automatically. Our AI-powered 
              system submits claims, tracks their status, and helps you understand your benefits.
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Automated Claims Submission" 
                  secondary="Claims are filed electronically immediately after your visit"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Real-time Status Tracking" 
                  secondary="Monitor where your claim is in the process at any time"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="AI-assisted EOB Interpretation" 
                  secondary="Get plain-language explanations of your benefits statements"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><ReceiptIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Streamlined Appeals Process" 
                  secondary="Easy-to-use tools if a claim is denied"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image="https://via.placeholder.com/600x350?text=Claims+Dashboard"
                alt="Claims dashboard example"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Example of the claims dashboard showing status tracking and explanation of benefits.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Cost Transparency */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CompareIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Cost Transparency
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image="https://via.placeholder.com/600x350?text=Cost+Comparison+Tool"
                alt="Cost comparison tool example"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Our cost comparison tool helps you find the most affordable options for your healthcare needs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              We believe healthcare costs should never be a surprise. Our platform provides unprecedented transparency 
              into what you'll pay before you receive services.
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><CompareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Upfront Cost Estimates" 
                  secondary="Know exactly what you'll pay before your appointment"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CompareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Service Cost Comparison" 
                  secondary="Compare costs across different providers and facilities"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CompareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Historical Cost Tracking" 
                  secondary="Monitor changes in prices for recurring services"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CompareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Personalized Savings Opportunities" 
                  secondary="AI-powered recommendations to reduce your healthcare costs"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>

      {/* Financial Assistance */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MonetizationOnIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Financial Assistance
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" paragraph>
          We're committed to making healthcare accessible to everyone, regardless of financial situation. 
          Our platform connects you with various assistance programs and flexible payment options.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Assistance Eligibility
                </Typography>
                <Typography variant="body2">
                  AI-powered screening tool determines your eligibility for financial assistance programs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Sliding Scale Options
                </Typography>
                <Typography variant="body2">
                  Pay what you can afford based on your income and family size
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Patient Assistance Programs
                </Typography>
                <Typography variant="body2">
                  Connect to programs that help cover medication and treatment costs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  Charity Care
                </Typography>
                <Typography variant="body2">
                  Integrated application process for charity care and financial hardship programs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpOutlineIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h4" component="h2">
            Frequently Asked Questions
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography variant="subtitle1">What if my insurance changes?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              If your insurance changes, simply update your information in the "Insurance" section of your profile. 
              Upload images of your new insurance card, and our system will automatically verify your new coverage. 
              You can update your insurance information anytime, and we recommend doing so as soon as changes occur 
              to ensure accurate cost estimates and coverage verification for upcoming appointments.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography variant="subtitle1">How do I know what will be covered?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Before every appointment, our AI system automatically checks your insurance coverage for the specific 
              service you're scheduled to receive. You'll see a detailed breakdown of expected coverage, including 
              estimated out-of-pocket costs, how much counts toward your deductible, and any co-pays or co-insurance. 
              If a service might not be covered, you'll receive an alert before your appointment so you can make an 
              informed decision.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography variant="subtitle1">What happens if a claim is denied?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              If your claim is denied, we'll notify you immediately with a clear explanation of the reason. Our platform 
              provides a streamlined appeals process that helps you challenge the denial if appropriate. You'll find 
              step-by-step guidance, auto-generated appeal letters based on your specific situation, and real-time 
              tracking of your appeal's status. Our support team is also available to assist you throughout the process.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
          >
            <Typography variant="subtitle1">Can I get a cost estimate before my appointment?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              Yes! Cost estimates are provided automatically when you schedule an appointment. The estimate factors in 
              your specific insurance benefits, remaining deductible, provider rates, and typical costs for your 
              particular service. You can view these estimates at any time from your dashboard. For more complex 
              procedures or treatments, you can request a detailed estimate that breaks down all potential costs.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5bh-content"
            id="panel5bh-header"
          >
            <Typography variant="subtitle1">How do I update my billing information?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              To update your billing information, navigate to the "Payment Methods" section under your account settings. 
              Here you can add, edit, or remove payment methods, update your billing address, and set your default 
              payment method for appointments. Your information is securely stored and encrypted to protect your 
              privacy. You can also set up automatic payments or enable email notifications for upcoming charges.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Need More Information?
        </Typography>
        <Typography variant="body1" paragraph>
          Our support team is here to help with any billing or insurance questions.
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Contact Support
        </Button>
      </Box>
    </Container>
  );
};

export default BillingInsurance;