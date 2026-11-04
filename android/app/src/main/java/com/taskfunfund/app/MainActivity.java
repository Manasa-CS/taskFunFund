package com.taskfunfund.app;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Tablets (smallest-width >= 600dp) get both orientations; phones stay portrait-only.
    private static final int TABLET_SMALLEST_WIDTH_DP = 600;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean isTablet = getResources().getConfiguration().smallestScreenWidthDp >= TABLET_SMALLEST_WIDTH_DP;
        setRequestedOrientation(isTablet
            ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }
}
