import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Badge, Progress, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faHeartbeat, 
  faPills, 
  faRunning,
  faLightbulb,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const AIHealthInsightsPanel = ({ 
  insights, 
  loading = false, 
  error = null, 
  onRefresh = null 
}) => {
  if (loading) {
    return (
      <Card className="ai-insights-card">
        <CardBody className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Generating insights...</span>
          </div>
          <p className="text-muted">AI is analyzing your health data...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="ai-insights-card border-warning">
        <CardBody className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mb-2" size="2x" />
          <h6 className="text-warning">AI Insights Unavailable</h6>
          <p className="text-muted mb-3">{error}</p>
          {onRefresh && (
            <Button color="outline-primary" size="sm" onClick={onRefresh}>
              Try Again
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="ai-insights-container">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faRobot} className="text-primary me-2" size="lg" />
          <h4 className="mb-0">AI Health Insights</h4>
          <Badge color="secondary" className="ms-2">
            {insights.aiMetadata?.modelUsed || 'AI-Generated'}
          </Badge>
        </div>
        {onRefresh && (
          <Button color="outline-primary" size="sm" onClick={onRefresh}>
            <FontAwesomeIcon icon={faRobot} className="me-1" />
            Refresh
          </Button>
        )}
      </div>

      {/* Health Score */}
      {insights.healthScore && (
        <HealthScoreCard healthScore={insights.healthScore} />
      )}

      {/* Personalized Tips */}
      {insights.personalizedTips && insights.personalizedTips.length > 0 && (
        <PersonalizedTipsCard tips={insights.personalizedTips} />
      )}

      {/* Risk Factors */}
      {insights.riskFactors && insights.riskFactors.length > 0 && (
        <RiskFactorsCard riskFactors={insights.riskFactors} />
      )}

      {/* Metadata */}
      {insights.aiMetadata && (
        <AIMetadataFooter metadata={insights.aiMetadata} generatedAt={insights.generatedAt} />
      )}
    </div>
  );
};

// Health Score Component
const HealthScoreCard = ({ healthScore }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score) => {
    if (score >= 85) return faCheckCircle;
    if (score >= 70) return faHeartbeat;
    if (score >= 50) return faInfoCircle;
    return faExclamationTriangle;
  };

  return (
    <Card className="health-score-card mb-4">
      <CardBody>
        <div className="text-center mb-3">
          <FontAwesomeIcon 
            icon={getScoreIcon(healthScore.overall)} 
            className={`text-${getScoreColor(healthScore.overall)} mb-2`} 
            size="2x" 
          />
          <h3 className={`text-${getScoreColor(healthScore.overall)} mb-1`}>
            {healthScore.overall}/100
          </h3>
          <p className="text-muted mb-0">Overall Health Score</p>
        </div>

        {healthScore.breakdown && (
          <div className="score-breakdown">
            <h6 className="mb-3">Score Breakdown</h6>
            <div className="row">
              <div className="col-md-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small">
                    <FontAwesomeIcon icon={faHeartbeat} className="me-1" />
                    Vitals
                  </span>
                  <span className="small font-weight-bold">{healthScore.breakdown.vitals}</span>
                </div>
                <Progress 
                  value={healthScore.breakdown.vitals} 
                  color={getScoreColor(healthScore.breakdown.vitals)}
                  className="progress-sm"
                />
              </div>
              <div className="col-md-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small">
                    <FontAwesomeIcon icon={faPills} className="me-1" />
                    Medications
                  </span>
                  <span className="small font-weight-bold">{healthScore.breakdown.medications}</span>
                </div>
                <Progress 
                  value={healthScore.breakdown.medications} 
                  color={getScoreColor(healthScore.breakdown.medications)}
                  className="progress-sm"
                />
              </div>
              <div className="col-md-4 mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small">
                    <FontAwesomeIcon icon={faRunning} className="me-1" />
                    Lifestyle
                  </span>
                  <span className="small font-weight-bold">{healthScore.breakdown.lifestyle}</span>
                </div>
                <Progress 
                  value={healthScore.breakdown.lifestyle} 
                  color={getScoreColor(healthScore.breakdown.lifestyle)}
                  className="progress-sm"
                />
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Personalized Tips Component
const PersonalizedTipsCard = ({ tips }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medication': return faPills;
      case 'lifestyle': return faRunning;
      case 'diet': return faLightbulb;
      case 'exercise': return faRunning;
      case 'monitoring': return faHeartbeat;
      default: return faInfoCircle;
    }
  };

  return (
    <Card className="personalized-tips-card mb-4">
      <CardBody>
        <h5 className="mb-3">
          <FontAwesomeIcon icon={faLightbulb} className="text-warning me-2" />
          Personalized Health Tips
        </h5>
        
        <div className="tips-list">
          {tips.slice(0, 6).map((tip, index) => (
            <div key={index} className="tip-item p-3 mb-2 border rounded">
              <div className="d-flex align-items-start">
                <FontAwesomeIcon 
                  icon={getCategoryIcon(tip.category)} 
                  className="text-primary me-2 mt-1" 
                />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <h6 className="mb-0 me-2">{tip.title}</h6>
                    <Badge color={getPriorityColor(tip.priority)} size="sm">
                      {tip.priority}
                    </Badge>
                    {tip.actionable && (
                      <Badge color="success" size="sm" className="ms-1">
                        Actionable
                      </Badge>
                    )}
                  </div>
                  <p className="mb-0 text-muted small">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

// Risk Factors Component
const RiskFactorsCard = ({ riskFactors }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'danger';
      case 'moderate': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Card className="risk-factors-card mb-4">
      <CardBody>
        <h5 className="mb-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2" />
          Risk Assessment
        </h5>
        
        <div className="risk-factors-list">
          {riskFactors.map((risk, index) => (
            <div key={index} className="risk-item p-3 mb-3 border rounded">
              <div className="d-flex align-items-center mb-2">
                <h6 className="mb-0 me-2">{risk.condition}</h6>
                <Badge color={getRiskColor(risk.riskLevel)}>
                  {risk.riskLevel} risk
                </Badge>
              </div>
              
              {risk.factors && risk.factors.length > 0 && (
                <div className="mb-2">
                  <strong className="small">Risk Factors:</strong>
                  <ul className="mb-0 mt-1 small">
                    {risk.factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {risk.preventionTips && risk.preventionTips.length > 0 && (
                <div>
                  <strong className="small">Prevention Tips:</strong>
                  <ul className="mb-0 mt-1 small">
                    {risk.preventionTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

// AI Metadata Footer
const AIMetadataFooter = ({ metadata, generatedAt }) => {
  return (
    <Card className="ai-metadata-card border-light">
      <CardBody className="py-2">
        <div className="d-flex justify-content-between align-items-center text-muted small">
          <div>
            <FontAwesomeIcon icon={faRobot} className="me-1" />
            Generated by {metadata.modelUsed}
            {metadata.processingTime && (
              <span className="ms-2">({metadata.processingTime}ms)</span>
            )}
          </div>
          <div>
            Data quality: <Badge color="secondary" size="sm">{metadata.dataQuality}</Badge>
            {generatedAt && (
              <span className="ms-2">
                {new Date(generatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// PropTypes
AIHealthInsightsPanel.propTypes = {
  insights: PropTypes.shape({
    healthScore: PropTypes.shape({
      overall: PropTypes.number,
      breakdown: PropTypes.shape({
        vitals: PropTypes.number,
        medications: PropTypes.number,
        lifestyle: PropTypes.number
      })
    }),
    personalizedTips: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string,
        priority: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        actionable: PropTypes.bool
      })
    ),
    riskFactors: PropTypes.arrayOf(
      PropTypes.shape({
        condition: PropTypes.string,
        riskLevel: PropTypes.string,
        factors: PropTypes.arrayOf(PropTypes.string),
        preventionTips: PropTypes.arrayOf(PropTypes.string)
      })
    ),
    aiMetadata: PropTypes.shape({
      modelUsed: PropTypes.string,
      processingTime: PropTypes.number,
      dataQuality: PropTypes.string
    }),
    generatedAt: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func
};

export default AIHealthInsightsPanel;