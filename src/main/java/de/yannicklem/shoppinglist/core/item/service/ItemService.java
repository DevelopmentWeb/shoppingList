package de.yannicklem.shoppinglist.core.item.service;

import de.yannicklem.shoppinglist.core.item.entity.Item;
import de.yannicklem.shoppinglist.core.user.security.service.CurrentUserService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired ))
public class ItemService {

    private final CurrentUserService currentUserService;
    private final ItemValidationService itemValidationService;

    public void handleBeforeCreate(Item item) {

        if (item != null) {
            item.getOwners().add(currentUserService.getCurrentUser());
        }

        itemValidationService.validate(item);
    }
}
