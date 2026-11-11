
package com.eventtix.algorithm;

import com.eventtix.model.Event;
import java.util.ArrayList;
import java.util.List;

public class EventMergeSort {

    public static List<Event> sortByDate(List<Event> events) {
        List<Event> result = new ArrayList<>(events);
        mergeSort(result, 0, result.size() - 1);
        return result;
    }

    private static void mergeSort(
            List<Event> events, int left, int right) {

        if (left >= right) {
            return;
        }

        int mid = left + (right - left) / 2;

        mergeSort(events, left, mid);
        mergeSort(events, mid + 1, right);

        merge(events, left, mid, right);
    }

    private static void merge(
            List<Event> events, int left, int mid, int right) {

        List<Event> temp = new ArrayList<>();

        int i = left;
        int j = mid + 1;

        while (i <= mid && j <= right) {
            if (!events.get(i).getDateTime()
                    .isAfter(events.get(j).getDateTime())) {

                temp.add(events.get(i++));
            } else {
                temp.add(events.get(j++));
            }
        }

        while (i <= mid) {
            temp.add(events.get(i++));
        }

        while (j <= right) {
            temp.add(events.get(j++));
        }

        for (int k = 0; k < temp.size(); k++) {
            events.set(left + k, temp.get(k));
        }
    }
}
