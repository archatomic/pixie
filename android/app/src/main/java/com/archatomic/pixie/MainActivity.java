package com.archatomic.pixie;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/** @see https://github.com/ionic-team/capacitor/pull/4409/commits/cc2b977325d00782de01df4a31de3460720346c3 */
import android.os.Build;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER;

        registerPlugin(ZoomPlugin.class);

    }
}
