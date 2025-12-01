from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from prophet import Prophet
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error, mean_squared_log_error,
    mean_absolute_percentage_error, median_absolute_error, max_error,
    explained_variance_score, mean_pinball_loss, d2_tweedie_score, d2_pinball_score
)
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route('/api/forecast/prophet', methods=['POST'])
def prophet_forecast():
    """
    Forecast sales using Facebook Prophet on all available data
    Expects JSON with 'sales_data' array of {date, sales} objects
    """
    try:
        data = request.get_json()
        sales_data = data.get('sales_data', [])
        forecast_periods = data.get('forecast_periods', 12)  # Future forecast periods
        
        if not sales_data:
            return jsonify({'error': 'No sales data provided'}), 400
        
        # Convert to DataFrame with Prophet's required format
        df = pd.DataFrame(sales_data)
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = df['sales']
        df = df[['ds', 'y']].sort_values('ds')
        
        # Initialize and fit Prophet model on ALL data
        model = Prophet(
            seasonality_mode='additive',
            seasonality_prior_scale=10,
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False
        )
        model.fit(df)
        
        # Make predictions on historical data
        historical_predict = model.predict(df)
        
        # Make future predictions - only first day of each month
        last_date = df['ds'].iloc[-1]
        future_dates = pd.date_range(
            start=last_date + pd.DateOffset(months=1),
            periods=forecast_periods,
            freq='MS'  # Month Start frequency - first day of each month
        )
        future = pd.DataFrame({'ds': future_dates})
        future_predict = model.predict(future)
        
        # Calculate evaluation metrics on historical data
        actual = df['y'].values
        pred = historical_predict['yhat'].values
        
        # Ensure positive values for metrics that require them
        actual_pos = np.maximum(actual, 1e-10)
        pred_pos = np.maximum(pred, 1e-10)
        
        r2 = r2_score(actual, pred)
        mae = mean_absolute_error(actual, pred)
        mse = mean_squared_error(actual, pred)
        rmse = np.sqrt(mse)
        
        try:
            msle = mean_squared_log_error(actual_pos, pred_pos)
        except:
            msle = 0
        
        mape = mean_absolute_percentage_error(actual, pred)
        accuracy = (1 - mape) * 100
        medae = median_absolute_error(actual, pred)
        me = max_error(actual, pred)
        evs = explained_variance_score(actual, pred)
        
        try:
            mpl = mean_pinball_loss(actual, pred)
        except:
            mpl = 0
            
        try:
            d2t = d2_tweedie_score(actual, pred)
        except:
            d2t = 0
            
        try:
            d2p = d2_pinball_score(actual, pred)
        except:
            d2p = 0
        
        # Prepare historical data with predictions
        historical_data = []
        for idx, row in df.iterrows():
            pred_val = historical_predict.loc[historical_predict['ds'] == row['ds'], 'yhat'].values
            historical_data.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'actual': float(row['y']),
                'predicted': float(pred_val[0]) if len(pred_val) > 0 else None
            })
        
        # Future forecast (beyond historical data)
        future_forecast = []
        for idx, row in future_predict.iterrows():
            future_forecast.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'forecast': float(row['yhat']),
                'forecast_lower': float(row['yhat_lower']),
                'forecast_upper': float(row['yhat_upper'])
            })
        
        # Get trend component (combine historical and future)
        trend_data = []
        for idx, row in historical_predict.iterrows():
            trend_data.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'trend': float(row['trend'])
            })
        for idx, row in future_predict.iterrows():
            trend_data.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'trend': float(row['trend'])
            })
        
        return jsonify({
            'success': True,
            'historical_data': historical_data,
            'future_forecast': future_forecast[:forecast_periods],
            'trend': trend_data,
            'metrics': {
                'r2': float(r2),
                'mae': float(mae),
                'mse': float(mse),
                'rmse': float(rmse),
                'msle': float(msle),
                'mape': float(mape),
                'accuracy': float(accuracy),
                'medae': float(medae),
                'max_error': float(me),
                'explained_variance': float(evs),
                'mean_pinball_loss': float(mpl),
                'd2_tweedie': float(d2t),
                'd2_pinball': float(d2p)
            },
            'data_info': {
                'total_records': len(df),
                'forecast_periods': forecast_periods
            }
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'Prophet Forecasting'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
