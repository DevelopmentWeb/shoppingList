package de.yannicklem.shoppinglist.core.persistence;

import de.yannicklem.shoppinglist.core.item.entity.Item;
import de.yannicklem.shoppinglist.core.list.entity.ShoppingList;
import de.yannicklem.shoppinglist.core.user.entity.SLUser;
import de.yannicklem.shoppinglist.exception.EntityInvalidException;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.util.Set;


@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired ))
public class ShoppingListValidationService {

    private final ItemValidationService itemValidationService;
    private final SLUserValidationService slUserValidationService;

    public void validate(ShoppingList shoppingList) throws EntityInvalidException {

        if (shoppingList == null) {
            throw new EntityInvalidException("shoppingList must not be null");
        }

        validateOwners(shoppingList.getOwners());
        validateItems(shoppingList.getItems());
        validateName(shoppingList.getName());
    }


    private void validateOwners(Set<SLUser> owners) {

        if (owners == null || owners.isEmpty()) {
            throw new EntityInvalidException("Owners must not be null or empty");
        }

        owners.forEach(slUserValidationService::validate);
    }


    private void validateItems(Set<Item> items) {

        if (items == null) {
            throw new EntityInvalidException("Items must not be null");
        }

        items.forEach(itemValidationService::validate);
    }


    private void validateName(String name) {

        if (name == null || name.isEmpty()) {
            throw new EntityInvalidException("Name must not be null or empty");
        }
    }
}