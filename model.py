import torch
import torch.nn as nn

# Component 1: Residual Block - creates a shortcut, allows og data to bypass processing layers and be added back at the end
class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()

        #1st Layer - It slides a small window over the image to find features
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        
        #2nd Layer - Refines 1st
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # If the input size changes, we need to adjust the shortcut so we can add them mathematically
        self.shortcut = nn.Sequential()
        self.use_shortcut = stride != 1 or in_channels != out_channels
        if self.use_shortcut:
            self.shortcut = nn.Sequential( nn.Conv2d(in_channels, out_channels, 1, stride=stride, bias=False), nn.BatchNorm2d(out_channels))

    def forward(self, x, fmap_dict=None, prefix=""):
        
        #1st convolution Process Data from Convolution -> Normalize -> Activation
        out = self.conv1(x)
        out = self.bn1(out)

        # ReLU (Rectified Linear Unit) turns all negative numbers to 0.
        out = torch.relu(out)

        #2nd convolution
        out = self.conv2(out)
        out = self.bn2(out)
        shortcut = self.shortcut(x) if self.use_shortcut else x
        out_add = out + shortcut

        #Save feature map for visualization
        if fmap_dict is not None:
            fmap_dict[f"{prefix}.conv"] = out_add

        #Final convolution
        out = torch.relu(out_add)
        if fmap_dict is not None:
            fmap_dict[f"{prefix}.relu"] = out

        return out

# Component 2: Main Brain
class AudioCNN(nn.Module):
    def __init__(self, num_classes=50):
        super().__init__()
        # INITIAL PROCESSING BLOCK The input is a Spectrogram
        self.conv1 = nn.Sequential(  nn.Conv2d(1, 64, 7, stride=2, padding=3, bias=False), nn.BatchNorm2d(64), nn.ReLU(inplace=True), nn.MaxPool2d(3, stride=2, padding=1))
       
        # Layer 1: Detects simple shapes
        self.layer1 = nn.ModuleList([ResidualBlock(64, 64) for i in range(3)])

        # Layer 2: Detects textures
        self.layer2 = nn.ModuleList( [ResidualBlock(64 if i == 0 else 128, 128, stride=2 if i == 0 else 1) for i in range(4)])

        # Layer 3: Detects complex parts
        self.layer3 = nn.ModuleList([ResidualBlock(128 if i == 0 else 256, 256, stride=2 if i == 0 else 1) for i in range(6)])

        # Layer 4: Detects objects
        self.layer4 = nn.ModuleList( [ResidualBlock(256 if i == 0 else 512, 512, stride=2 if i == 0 else 1) for i in range(3)])

        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(512, num_classes)

    #defines the path the data takes through the brain
    def forward(self, x, return_feature_maps=False):
        if not return_feature_maps:
            x = self.conv1(x)
            for block in self.layer1:
                x = block(x)
            for block in self.layer2:
                x = block(x)
            for block in self.layer3:
                x = block(x)
            for block in self.layer4:
                x = block(x)
            x = self.avgpool(x)
            x = x.view(x.size(0), -1)
            x = self.dropout(x)
            x = self.fc(x)
            return x
        else:
            feature_maps = {}
            x = self.conv1(x)
            feature_maps["conv1"] = x

            for i, block in enumerate(self.layer1):
                x = block(x, feature_maps, prefix=f"layer1.block{i}")
            feature_maps["layer1"] = x

            for i, block in enumerate(self.layer2):
                x = block(x, feature_maps, prefix=f"layer2.block{i}")
            feature_maps["layer2"] = x

            for i, block in enumerate(self.layer3):
                x = block(x, feature_maps, prefix=f"layer3.block{i}")
            feature_maps["layer3"] = x

            for i, block in enumerate(self.layer4):
                x = block(x, feature_maps, prefix=f"layer4.block{i}")
            feature_maps["layer4"] = x

            x = self.avgpool(x)
            x = x.view(x.size(0), -1)
            x = self.dropout(x)
            x = self.fc(x)
            return x, feature_maps