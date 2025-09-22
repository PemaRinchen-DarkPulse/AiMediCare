const DiagnosticInsights = require('../models/DiagnosticInsights');
const axios = require('axios');

// AI Service configuration
const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Get AI insights for a diagnostic test result
 * Returns cached insights if available, otherwise triggers new analysis
 */
const getDiagnosticInsights = async (req, res) => {
  try {
    // Support both testResultId and id parameters for flexibility
    const testResultId = req.params.testResultId || req.params.id;

    if (!testResultId) {
      return res.status(400).json({
        success: false,
        message: 'Test result ID is required'
      });
    }

    // Check if insights already exist in cache
    let insights = await DiagnosticInsights.findByTestResultId(testResultId);

    if (insights) {
      // Return cached insights if they exist and are not stale
      if (!insights.isStale() && insights.processingStatus === 'completed') {
        return res.status(200).json({
          success: true,
          data: insights,
          cached: true
        });
      }
    }

    // If no insights exist or they're stale, trigger new analysis
    if (!insights) {
      insights = new DiagnosticInsights({
        testResultId,
        processingStatus: 'pending'
      });
      await insights.save();
    }

    // Return pending status for now, actual processing will be done asynchronously
    res.status(202).json({
      success: true,
      message: 'AI analysis initiated. Please check back in a few moments.',
      data: insights,
      cached: false
    });

    // Trigger async processing (don't await to avoid blocking the response)
    processTestResultAsync(testResultId, insights._id).catch(error => {
      console.error('Error in async processing:', error);
    });

  } catch (error) {
    console.error('Error getting diagnostic insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diagnostic insights',
      error: error.message
    });
  }
};

/**
 * Trigger new AI analysis for a test result (force refresh)
 */
const triggerNewAnalysis = async (req, res) => {
  try {
    // Support both testResultId and id parameters for flexibility
    const testResultId = req.params.testResultId || req.params.id;
    const { attachmentUrl, testType, findings } = req.body;

    if (!testResultId) {
      return res.status(400).json({
        success: false,
        message: 'Test result ID is required'
      });
    }

    // Create or update insights record
    let insights = await DiagnosticInsights.findOne({ testResultId });
    
    if (!insights) {
      insights = new DiagnosticInsights({
        testResultId,
        processingStatus: 'pending'
      });
    } else {
      insights.processingStatus = 'pending';
      insights.processingError = null;
    }

    await insights.save();

    res.status(202).json({
      success: true,
      message: 'AI analysis triggered successfully',
      data: insights
    });

    // Process asynchronously
    processTestResultAsync(testResultId, insights._id, {
      attachmentUrl,
      testType,
      findings
    }).catch(error => {
      console.error('Error in async processing:', error);
    });

  } catch (error) {
    console.error('Error triggering new analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger new analysis',
      error: error.message
    });
  }
};

/**
 * Get analysis status for a test result
 */
const getAnalysisStatus = async (req, res) => {
  try {
    const { testResultId } = req.params;

    const insights = await DiagnosticInsights.findOne({ testResultId });

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found for this test result'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: insights.processingStatus,
        error: insights.processingError,
        updatedAt: insights.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting analysis status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis status',
      error: error.message
    });
  }
};

/**
 * Async function to process test result with AI
 */
const processTestResultAsync = async (testResultId, insightsId, additionalData = {}) => {
  const startTime = Date.now();
  
  try {
    // Update status to processing
    await DiagnosticInsights.findByIdAndUpdate(insightsId, {
      processingStatus: 'processing'
    });

    // Prepare data for AI service
    const analysisData = {
      testResultId,
      attachmentUrl: additionalData.attachmentUrl,
      testType: additionalData.testType,
      findings: additionalData.findings
    };

    // Call AI service for insights generation
    const aiResponse = await axios.post(`${AI_SERVICE_BASE_URL}/api/generate-insights`, analysisData, {
      timeout: 300000, // 5 minutes timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!aiResponse.data.success) {
      throw new Error(aiResponse.data.message || 'AI analysis failed');
    }

    const analysisResult = aiResponse.data.data;
    const processingTime = Date.now() - startTime;

    // Update insights with AI results
    await DiagnosticInsights.findByIdAndUpdate(insightsId, {
      extractedText: analysisResult.extractedText || '',
      structuredData: analysisResult.structuredData || {},
      abnormalFindings: analysisResult.abnormalFindings || [],
      aiSummary: analysisResult.aiSummary || '',
      riskAssessment: analysisResult.riskAssessment || { level: 'low', description: '' },
      processingStatus: 'completed',
      processingError: null,
      aiModel: analysisResult.aiModel || 'gemini-1.5-flash',
      confidence: analysisResult.confidence || 0,
      sourceFile: analysisResult.sourceFile || {
        fileName: 'unknown',
        fileType: 'unknown', 
        fileSize: 0,
        processingTime
      }
    });

    console.log(`AI analysis completed for test result ${testResultId} in ${processingTime}ms`);

  } catch (error) {
    console.error('Error in async AI processing:', error);
    
    // Update insights with error status
    await DiagnosticInsights.findByIdAndUpdate(insightsId, {
      processingStatus: 'failed',
      processingError: error.message || 'Unknown error occurred during AI analysis'
    });
  }
};

/**
 * Delete insights for a test result
 */
const deleteInsights = async (req, res) => {
  try {
    const { testResultId } = req.params;

    const result = await DiagnosticInsights.findOneAndDelete({ testResultId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No insights found for this test result'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Insights deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete insights',
      error: error.message
    });
  }
};

module.exports = {
  getDiagnosticInsights,
  triggerNewAnalysis,
  getAnalysisStatus,
  deleteInsights
};