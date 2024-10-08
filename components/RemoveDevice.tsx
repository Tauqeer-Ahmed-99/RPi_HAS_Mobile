import Tile from "@/components/Tile";
import { useRoomData } from "@/hooks/useHouse";
import useRemoveDeviceMutation from "@/hooks/useRemoveDeviceMutation";
import useUsername from "@/hooks/useUsername";
import { ApiRoutes } from "@/routes/routes";
import { useUser } from "@clerk/clerk-expo";
import { BottomSheet, Button, Text, useTheme } from "@rneui/themed";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ToastAndroid, View } from "react-native";

const RemoveDevice = () => {
  const {
    theme: {
      colors: { primary, success, error },
    },
  } = useTheme();
  const { roomId, deviceId } = useLocalSearchParams();
  const room = useRoomData(roomId as string);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { mutate: removeDevice, isPending: isRemovingDevice } =
    useRemoveDeviceMutation();
  const { user } = useUser();
  const username = useUsername();

  const queryClient = useQueryClient();

  const removeDeviceConfirm = useCallback(() => {
    setIsConfirmationOpen(false);
    removeDevice(
      {
        userId: user?.id,
        userName: username,
        houseId: room?.house_id,
        roomId,
        deviceId,
        deviceName: room?.devices?.find(
          (device) => device.device_id === deviceId,
        )?.device_name,
      },
      {
        onSuccess: (res) => {
          if (res.status === "success") {
            router.back();
            queryClient.invalidateQueries({ queryKey: [ApiRoutes.UserHouse] });
          } else {
            ToastAndroid.show(res.message, ToastAndroid.LONG);
          }
        },
        onError: (res) => {
          ToastAndroid.show(res.message, ToastAndroid.LONG);
        },
      },
    );
  }, []);

  return (
    <>
      <Tile>
        <Button
          type="outline"
          color="success"
          containerStyle={{
            borderRadius: 6,
            borderWidth: 1,
            borderColor: error,
          }}
          titleStyle={{ color: error }}
          onPress={() => setIsConfirmationOpen(true)}
        >
          Remove Device
        </Button>
      </Tile>
      <BottomSheet
        isVisible={isConfirmationOpen}
        onBackdropPress={() => setIsConfirmationOpen(false)}
      >
        <View
          style={{
            height: 150,
            padding: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: primary,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>Are you sure?</Text>
          <Text>Do you really want to delete this device?</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button onPress={() => setIsConfirmationOpen(false)}>Cancel</Button>
            <Button color="error" onPress={() => removeDeviceConfirm()}>
              Yes
            </Button>
          </View>
        </View>
      </BottomSheet>
      <BottomSheet isVisible={isRemovingDevice}>
        <View
          style={{
            height: 100,
            padding: 20,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: primary,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <ActivityIndicator size="large" color={success} />
          <Text>Loading, please wait...</Text>
        </View>
      </BottomSheet>
    </>
  );
};

export default RemoveDevice;
